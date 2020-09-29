import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// https://regex101.com/r/FAUDYV/3/
const separeAttribution = new RegExp(/^([A-Z]{1})(\s*=\s*)([a-zA-Z].*)$/);

@Component({
  selector: 'test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.scss'],
})
export class Test1Component implements OnInit {
  gramatic: string;
  tokens: ListTokens;
  form: FormGroup;

  // TODO: remover isso
  defaultValue = `S = aaA | bbA
S = aaA | bbA|ab
S = aaA | bbA
A = aaB | S
B= Aas|ssA
B =asd|asda
B = s
C = aaS |c
C=ss
C=ss|a`;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      gramatic: this.fb.control(this.defaultValue),
    });
  }

  ngOnInit(): void {}

  execute(): void {
    this.clearTokens();
    this.handleGramatic(this.form.get('gramatic').value);
    this.verifyGramatic(this.handleGramatic(this.form.get('gramatic').value));
  }

  splitLines(gramatic: string): string[] {
    return gramatic.split(/\n/gm);
  }

  extractSentenceParts(line: string): string[] {
    return separeAttribution.exec(line);
  }

  handleGramatic(gramatic: string): ListTokens | null {
    const lines = this.splitLines(gramatic);
    const parsed = lines.map((line) => {
      const extractParts = this.extractSentenceParts(line);

      if (extractParts) {
        const allSentence = extractParts[0];
        const token = extractParts[1];
        const sentences = this.sanitizeSentences(extractParts[3].split('|'));

        const currentToken: ListTokens = {
          [token]: {
            allSentence,
            sentences,
          },
        };

        this.tokens = {
          ...this.tokens,
          ...currentToken,
        };

        return currentToken;
      }
    });

    parsed.map((el) => el[0]).forEach((item) => console.log(item));
    console.log(parsed);
  }

  verifyGramatic(tokens: ListTokens): boolean {
    console.log(tokens);
    tokens.filter((item, index) => {
      console.log(item);
    });

    return true;
  }

  sanitizeSentences(sentences: string[]): string[] {
    return sentences.map((el) => el.replace(/\s/g, ''));
  }

  clearTokens(): void {
    this.tokens = {};
  }

  // extractAfterAttribution(gramatic: string): void {
  //   let m;

  //   while ((m = separeAttribution.exec(gramatic)) !== null) {
  //     if (m.index === separeAttribution.lastIndex) {
  //       separeAttribution.lastIndex++;
  //     }

  //     // extract tokens
  //     m.forEach((match, groupIndex) => {
  //       const sentence: ListTokens = {};
  //       if (groupIndex === 1) sentence[match] = {};
  //       if (groupIndex === 0)
  //         sentence[match] = { ...sentence[match], allSentence: match };

  //       // example: aaA | bbA
  //       if (groupIndex === 3) {
  //         sentence[match] = { ...sentence[match], sentences: match };
  //       }

  //       this.tokens = { ...this.tokens, sentence };

  //       console.log(`Found match, group ${groupIndex}: ${match}`);
  //     });
  //   }
  // }
}

interface Token {
  allSentence?: string;
  sentences?: string[];
}

interface ListTokens {
  [key: string]: Token;
}
