# What Is This?

Writer is a hopeful replacement for LaTeX and Word. The motivation behind this project is that I don't like how verbose LaTeX is, and how little control I have over Word documents. It compiles plaintext into pdf files (much like LaTeX).

## Quick Intro
Essentially, writer is markdown with a bunch of handy macros that make writing formal papers a breeze. There are a few concepts that are important to understand before you can start writing documents with writer. 

### Markdown
Markdown is markup language which is designed to be readable both in plaintext and html. Find out more here: https://help.github.com/articles/markdown-basics/

### Macros
Before being compiled with markdown, a document is first processed with [Handlebars](http://handlebarsjs.com/). This allows us to have powerful macros. The syntax for macros is:

```
{{{macro_name first_option="some value" another=2 third="nice"}}}
```

### Metadata
* Information that is common between all documents (eg. author's name).
* Should be in json format. For example:
```
{
  "name": {
    "first": "Ivan",
    "last": "Chub",
    "full": "Ivan Chub"
  },
  "courses": [
    "period": 1,
    "teacher": "Mr. Teacher",
    "name": "English"
  ]
}
```
* This data can be accessed in any document using handlebars. Eg. to access my first name, I'd write `{{{name.first}}}`.
