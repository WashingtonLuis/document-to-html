# document-to-html

# Limpar Texto

Este projeto é uma aplicação web que permite a manipulação de texto, incluindo padronização de equações em LaTeX, conversão para HTML e ajuste de imagens. A aplicação utiliza a biblioteca Summernote para edição de texto enriquecido e inclui várias funcionalidades personalizadas implementadas em JavaScript.

## Funcionalidades

### Seletores

- **LaTeX:** Altere equações LaTeX para o padrão do site 'https://csdn.codecogs.com/eqneditor/editor.php'.
- **Não LaTeX:** Altere equações LaTeX para o padrão simples.
- **Facilidades:** Opções de ajustes de tag link, youTube e tabelas.
- **Manual:** Opções de formatação do modelo de manuais.

---

### Botões

- **Limpar:** Aplica todas as alterações de acordo com os seletores marcados e as alterações padrões.
- **Tag Equações:** Insere a tag '$$' nas equações para que sejam salva em um arquivo.
- **Converter para HTML:** Converte o Equações e texto para HTML.
- **Equação Grande:** Insere a tag de Matriz para uma leve redução na equeção.
- **Texto sem quebras:** Remove todas as tags e retira as quebras de linha.
- **Ajustar Equação para script SalvarEqn:** Ajusta todas as equações que estão no padrão LaTeX dentro da tag '\$$ equação $$... para que seja utiliza em um script para que crie e salve as imagens no padrão svg, no site 'https://csdn.codecogs.com/eqneditor/editor.php'.
- **Ajustar Equações SVG:** Ajusta imagens nos formatos SVG e substituição do seletor '##' para imagens SVG.
- **Ajustar imagens JPG/PNG:** Ajuste imagens nos formatos JPG e PNG e substituição do seletor '@@' para imagens JPG.
- **Inicial Maiúscula:** Formata o texto para começar com letra maiúscula todas as palavras com mais de 3 letras.
- **Escolher Número do Bloco:** Seleciona o número do bloco/capítulo para nomeação das imagens.

## Tecnologias Utilizadas

- HTML
- CSS
- JavaScript
- jQuery
- Summernote

## Estrutura do Projeto

- `index.html`: Arquivo principal da aplicação web.
- `style.css`: Estilos personalizados para a aplicação.
- `script.js`: Script JavaScript que contém a lógica para as funcionalidades.

## Uso de Expressões Regulares

No arquivo `script.js`, foram utilizadas diversas expressões regulares para manipulação de texto e formatação. Algumas das principais utilizações incluem:

- **Alteração de Equações:** Identificação e substituição de padrões específicos para formatação de equações no padrão LaTeX.
- **Conversão para HTML:** Limpeza e ajuste de tags HTML.
- **Ajuste de Imagens:** Substituição de seletor '##' ou '@@' e ajustes de nomes de equações e imagens.
- **Formatação de Texto:** Implementação de funcionalidades como iniciar com letra maiúscula e remover quebras de linha.

## Instruções de Configuração

1. Clone o repositório:
   ```bash
   git clone https://github.com/WashingtonLuis/document-to-html.git

2. Navegue até o diretório do projeto:
   ```bash
   cd document-to-html

3. Abra o arquivo index.html em seu navegador para usar a aplicação.


## Se precisar de mais alguma alteração ou adição, estou à disposição!