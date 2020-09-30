import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

// https://regex101.com/r/FAUDYV/3/
const separeAttribution = new RegExp(/^([A-Z]{1})(\s*=\s*)([a-zA-Z].*)$/);
const syntaxPattern = new RegExp(
  /^[A-Z]\s*\=\s*[A-Za-z| ]*[^|.+-/$%#@!*,;'`"\[\]{}^&()=_0-9]$/gm
);

@Component({
  selector: 'test1',
  templateUrl: './test1.component.html',
  styleUrls: ['./test1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Test1Component implements OnInit {
  private internalStack: string[] = [];
  private tokens: ListTokens;

  gramatic: string;
  form: FormGroup;
  callStack: string[];

  // TODO: remover isso
  defaultValue = `S = aaA | bbA|ab
A = aaB | ab
B =asd|asda
C = aaS |c`;

  constructor(private fb: FormBuilder, private toastr: MatSnackBar) {
    this.form = this.fb.group({
      startsWith: this.fb.control('', [Validators.required]),
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
    if (this.form.valid) {
      this.handleGramatic(this.form.get('gramatic').value);
      this.deriveSentences(this.form.get('startsWith').value);
    } else {
      this.form.markAllAsTouched();
      this.toastr.open('Formulário inválido, verifique os campos!', 'Fechar', {
        verticalPosition: 'top',
        horizontalPosition: 'right',
        duration: 5000,
      });
    }
  }

  deriveSentences(startsOn: string): void {
    console.log(this.tokens[startsOn].sentences);
    // console.log(this.sortSentence(this.tokens[startsOn].sentences));
  }

  sortSentence(sentences: string[]): string {
    const length = sentences.length;
    const sort = Math.floor(Math.random() * length);
    return sentences[sort];
  }

  splitLines(gramatic: string): string[] {
    return gramatic.split(/\n/gm);
  }

  extractSentenceParts(line: string): string[] {
    return separeAttribution.exec(line);
  }

  /**
   * Receive a gramatic, extract and parse tokens
   * @description
   * Use with `checkSyntax()` to verify all semantic
   * @param gramatic your gramatic
   * @example
   * S = aaB | baaA
   * A = bB | S...
   * @returns if gramatic have unique tokens
   */
  handleGramatic(gramatic: string): boolean {
    const lines = this.splitLines(gramatic);

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
      if (this.handleGramatic(ctrl.value) && this.checkSyntax(ctrl.value)) {
        return null;
      }

      ctrl.markAsTouched();
      return { gramatic: { valid: false } };
    };
  }

  checkSyntax(gramatic: string): boolean {
    const matches = gramatic.match(syntaxPattern);
    return Object.keys(this.tokens).length === matches.length;
  }

  sanitizeSentences(sentences: string[]): string[] {
    return sentences.map((el) => el.replace(/\s/g, ''));
  }

  clearTokens(): void {
    this.tokens = {};
  }
}

interface Token {
  allSentence?: string;
  sentences?: string[];
}

interface ListTokens {
  [key: string]: Token;
}
