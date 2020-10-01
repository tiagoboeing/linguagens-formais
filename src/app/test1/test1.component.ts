import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

const LIMIT_ITERATIONS = 2000;

// https://regex101.com/r/FAUDYV/7
const separeAttribution = new RegExp(/^([A-Z]{1})(\s*=\s*)([a-zA-Z].*)$/);

// https://regex101.com/r/B0tbks/1
const syntaxPattern = new RegExp(
  /^[A-Z]\s*\=\s*[A-Za-z| ]*[^|.+-/$%#@!*,;'`"\[\]\\{}^&()=_0-9]$/gm
);

const logsInitialState = `Passos executados <br/>--------------------- <br/><br/>`;

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
  callStack: {
    token: string;
    index: number;
    sentence: string;
  }[];
  logs = logsInitialState;

  result: string[];
  stats: { startDate?: Date; endDate?: Date; steps?: number };

  // TODO: remover isso
  defaultValue = `S = aaA | bbA|ab
A = aaB | ab
B =ab|abba
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
      this.addToLog(
        `Finalizou a derivação com o resultado: <b>${this.getResultantGramatic()}</b>`
      );
    } else {
      this.form.markAllAsTouched();
      this.showToastr('Formulário inválido, verifique os campos!');
    }
  }

  deriveSentences(startsOn: string): void {
    const sentences = this.tokens[startsOn].sentences;
    if (sentences) {
      this.clearStates();
      this.stats = { startDate: new Date() };

      this.addToLog(`🚀 Iniciando do token <b>${startsOn}</b>`);

      // sort initial sentence
      const { sentence, index } = this.sortSentence(sentences);
      this.callStack.push({
        token: startsOn,
        sentence,
        index,
      });

      this.addToLog(
        `Sorteada sentença ${
          index + 1
        } do token ${startsOn}: <b>${sentence}</b>`
      );

      // instantiate a stack based on start sentence tokens
      const sentenceTokens = Array.from(sentence);
      if (sentenceTokens.length > 0) {
        sentenceTokens.forEach((token) => this.internalStack.push(token));
      }

      // call recursive method
      this.executeInternalStack();
    } else {
      this.showToastr('Erro ao processar gramática');
    }
  }

  executeInternalStack() {
    let iteration = 0;
    while (this.internalStack.length !== 0) {
      if (iteration < LIMIT_ITERATIONS) {
        const token = this.internalStack[0];

        if (token && token === token.toLocaleLowerCase()) {
          this.result.push(token);
          this.internalStack.shift();
        } else if (token && token === token.toUpperCase()) {
          this.addToLog(`Encontrado não terminal <b>${token}</b>`);
          this.addToLog(`Iniciando derivação à partir de <b>${token}</b>`);

          const { sentence, index } = this.sortSentence(
            this.tokens[token].sentences
          );

          this.addToLog(
            `Sorteada sentença ${
              index + 1
            } do token ${token}: <b>${sentence}</b>`
          );

          const sentenceTokens = Array.from(sentence);
          if (sentenceTokens.length > 0) {
            sentenceTokens.forEach((token) => this.internalStack.push(token));
          }
          this.callStack.push({ token, index, sentence });
          this.internalStack.shift();

          // call recursive
          this.executeInternalStack();
        }
      } else {
        this.internalStack = [];
        console.error(`Iterations limit of ${LIMIT_ITERATIONS} exceeded!`);
      }

      iteration++;
    }

    this.stats = {
      ...this.stats,
      endDate: new Date(),
      steps: iteration,
    };
  }

  getResultantGramatic(): string {
    return this.result.join('');
  }

  sortSentence(sentences: string[]): { index: number; sentence: string } {
    const length = sentences.length;
    const sort = Math.floor(Math.random() * length);
    return { index: sort, sentence: sentences[sort] };
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

  clearStates(): void {
    this.logs = logsInitialState;
    this.stats = {};
    this.internalStack = [];
    this.result = [];
    this.callStack = [];
  }

  clearTokens(): void {
    this.tokens = {};
  }

  showToastr(message: string): void {
    this.toastr.open(message, 'Fechar', {
      verticalPosition: 'top',
      horizontalPosition: 'right',
      duration: 5000,
    });
  }

  addToLog(text: string): void {
    this.logs += `
    <div style="width: 100%; display: flex; flex-direction: row;">
      🕑 ${new Date().toLocaleString('pt-BR')}
      <span style="width: 100px">&nbsp;</span>
      <span>${text}</span>
    </div>
    `;
  }

  getExecutionDuration(): number {
    if (this.stats.startDate && this.stats.endDate)
      return Math.abs(<any>this.stats.endDate - <any>this.stats.startDate);
    return 0;
  }
}

interface Token {
  allSentence?: string;
  sentences?: string[];
}

interface ListTokens {
  [key: string]: Token;
}
