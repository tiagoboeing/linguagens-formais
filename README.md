# Linguagens Formais

Este é um repositório relacionado a práticas acadêmicas.

## Trabalho 1

> [Demonstração](https://tiagoboeing.github.io/linguagens-formais/#/)

[![](docs/screenshot.png)](https://tiagoboeing.github.io/linguagens-formais/#/)

Implementação da derivação de uma gramática a ser especificada eliminando os símbolos não terminais com a utilização de algoritmos de pilha. Neste cenário, os vetores do JavaScript com auxílio dos métodos `push()` e `shift()`.

Símbolos não terminais são representados por letras maiúsculas.

Exemplos válidos de gramáticas: 


- S = aa<ins>**A**</ins> | bb<ins>**A**</ins> | <ins>**C**</ins>
- A = aa<ins>**B**</ins> | ab
- B = ab | ab<ins>**B**</ins>
- C = aa<ins>**S**</ins> |c

> Os símbolos não terminais estão destacados na gramática.


### Execução

Baseado na gramática abaixo como exemplo:

```
S = aAA
A = ab
```

Partindo do token `S`, a única derivação possível resulta em `aabab`.

1. a<ins>**A**</ins>A (analisando o não terminal A)
   1. Nesta etapa temos o resultado parcial: a
2. Visita token A em busca de sentenças e sorteia uma (neste caso só temos uma)
3. Substitui o não terminal A pela sentença sorteada: `ab`
   1. Nesta etapa temos o resultado parcial: `aab`
4. Visita o não terminal <ins>**A**</ins>
5. Substitui pela sentença sorteada `ab`
   1. Nesta etapa temos o resultado parcial: `aabab`
6. Não existem mais não terminais. Atingimos o resultado.
