import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

// https://regex101.com/r/FAUDYV/3/
const separeAttribution = new RegExp(/^([A-Z]{1})(\s*=\s*)([a-zA-Z].*)$/);

@Component({
  selector: 'test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Test1Component implements OnInit {
  private internalStack: string[] = [];

  gramatic: string;
  tokens: ListTokens;
  form: FormGroup;
  startsWith: string;
  callStack: string[];

  // TODO: remover isso
  defaultValue = `S = aaA | bbA|ab
A = aaB | ab
B =asd|asda
C = aaS |c`;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      gramatic: this.fb.control(
        this.defaultValue,
        [Validators.required],
        [this.verifyGramatic()]
      ),
    });
  }

  ngOnInit(): void {}

  listTokens(): string[] {
    return Object.keys(this.tokens);
  }

  execute(): void {
    this.handleGramatic(this.form.get('gramatic').value);
  }

  splitLines(gramatic: string): string[] {
    return gramatic.split(/\n/gm);
  }

  extractSentenceParts(line: string): string[] {
    return separeAttribution.exec(line);
  }

  /**
   * Receive a gramatic and verify if is valid
   * @param gramatic your gramatic
   * @example
   * S = aaB | baaA
   * A = bB | S...
   * @returns if gramatic is valid
   */
  handleGramatic(gramatic: string): boolean {
    const lines = this.splitLines(gramatic);

    console.log(lines);

    return lines
      .map((line: string) => {
        const extractParts = this.extractSentenceParts(line);

        if (extractParts?.length) {
          const allSentence = extractParts[0];
          const token = extractParts[1];
          const sentences = this.sanitizeSentences(
            extractParts[3].split('|')
          ).filter((el) => el !== '');

          return {
            [token]: {
              allSentence,
              sentences,
            },
          } as ListTokens;
        }
      })
      .every((item) => {
        if (item) {
          const key = Object.keys(item)[0];
          const hasUniqueKey = Object.keys(this.tokens).indexOf(key) === -1;

          this.tokens = {
            ...this.tokens,
            ...item,
          };

          return hasUniqueKey;
        }
      });
  }

  verifyGramatic(): AsyncValidatorFn {
    return async (
      ctrl: AbstractControl
    ): Promise<{ [key: string]: any } | null> => {
      this.clearTokens();
      if (this.handleGramatic(ctrl.value)) return null;

      ctrl.markAsTouched();
      return { gramatic: { valid: false } };
    };
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
