import { alteraElementos } from "./alteraElementos.js";
import { circuit } from "./circuit.js";
import { rotaCount } from "./rotaCount.js";
import { rota } from "./rota.js";

const latexAcentuacao = {
	á: "\\'a",
	é: "\\'e",
	í: "\\'i",
	ó: "\\'o",
	ú: "\\'u",
	ç: "\\c{c}",
	ã: "\\~a",
	õ: "\\~o",
	â: "\\^a",
	ê: "\\^e",
	ô: "\\^o",
};
const nLatexAcentuacao = {
	"\\'a": "á",
	"\\'e": "é",
	"\\'i": "í",
	"\\'o": "ó",
	"\\'u": "ú",
	"\\c{c}": "ç",
	"\\~a": "ã",
	"\\~o": "õ",
	"\\^a": "â",
	"\\^e": "ê",
	"\\^o": "ô",
};

const padroes = [
	[/exercícios\s+resolvidos/i, "Exercícios resolvidos"],
	[/exercícios\s+de\s+fixação/i, "Exercícios de fixação"],
	[/atividades\s+de\s+fixação/i, "Exercícios de fixação"],
	[/exercício\s+resolvido/i, "Exercício resolvido"],
	[/exercício\s+de\s+fixação/i, "Exercício de fixação"],
	[/atividade\s+de\s+fixação/i, "Exercício de fixação"],
	[/pesquisar\s+é\s+descobrir/i, "Pesquisar é descobrir"],
	[/hora\s+(da|de)\s+leitura/i, "Hora de leitura"],
	[/dialogando/i, "Dialogando"],
	[/foco\s+na\s+língua\s+portuguesa/i, "Foco na Língua Portuguesa"],
	[/você\s+é\s+o\s+autor/i, "Você é o autor"],
	[/compreensão\s+do\s+texto/i, "Compreensão do texto"],
	[/mão\s+na\s+massa/i, "Mão na massa"],
	[/revise\s+o\s+que\s+você\s+aprendeu/i, "Revise o que você aprendeu"],
	[/Revise\s+o\s+que\s+aprendeu/i, "Revise o que você aprendeu"],
	[/Atividades\s+Extras/i, "Atividades extras"],
	[/Atividade\s+Extra/i, "Atividade extra"],
	[/ler\s+e\s+(se\s+)?encantar(,)?\s+é\s+só\s+começar/i, "Ler e se encantar é só começar"],
	[/texto\s+e\s+contexto/i, "Texto e contexto"],
	[/momento\s+pipoca/i, "Momento pipoca"],
	[/Sessão\s+pipoca/i, "Momento pipoca"],
	[/saiba\s+mais/i, "Saiba mais"],
	[/cnec\s+virtual/i, "CNEC virtual"],
	[/Setting\s+the\s+scene/i, "Setting the scene"],
	[/Speak\s+up\!?/i, "Speak up!"],
	[/Reading\s+Time/i, "Reading time"],
	[/Let's\s+review/i, "Let's review"],
	[/Activities/i, "Activities"],
	[/Popcorn\s+time/i, "Popcorn time"],
	[/Did you know\??/i, "Did you know?"],
	[/Referências/i, "Referências"],
	[/Bibliografia/i, "Referências"],
];

function removerParenteses(input) {
	const output = input.replace(/(?<![■█┴#_]|left)\(([^()<.]*)\)/gi, "#[$1]#");
	return output === input ? output : removerParenteses(output);
}

function voltaParenteses(input) {
	const output = input.replace(/\#\[([^#]*)\]\#/gi, "\\left( $1 \\right)");
	return output === input ? output : voltaParenteses(output);
}

function removeSpan(input) {
	const output = input.replace(/<span(?! class="(?:d-none|fs-2 vertical-align-symbol|student-only|teacher-only|teacher-gap))[^<]*?>(?!<span)(.*?)<\/span>/gi, "$1");
	// const output = input.replace(/<span[^<]*?>(.*?[^<span>].*?)<\/span>/gi, "$1");
	return output === input ? output : removeSpan(output);
}

function removeEspacosExtras(input) {
	const output = input
		.replace(/(?:<p><br><\/p>|<br>|\s)+(?=@@|<ol class="options">|(?:<\/div>\s*<ol class="options">)|<div class="d-print-none">|<div class="d-none d-print-block">)/gi, "\n")
		.replace(/(?=@@)(?:<p><br><\/p>|<br>|\s)+/gi, "\n")
		.replace(/\n{2,}(?=<\/div>)/gi, "\n");
	return output === input ? output : removeEspacosExtras(output);
}

function textNLatex(input) {
	const output = input.replace(/(\^|_)\\(?:textrm|text)\{([^}]*)\}/gi, " $1$2 ").replace(/\\(?:textrm|mathrm|text|mathbit|textbf|mathbf)\{([^}]*)\}/gi, "$1");
	if (output === input) {
		return output
			.replace(/[ ]{2, }/gi, " ")
			.replace(/\( ?(.*?) ?\)/g, "($1)")
			.replace(/(?<=\b[A-Za-z]) \(/g, "(");
	} else {
		return textNLatex(output);
	}
}

function textLatex(input) {
	const output = input
		.replace(/[ ]{2,}/gi, " ")
		.replace(/\\textrm\{([^{}]+)\}\\textrm\{([^{}]+)\}/gi, " \\textrm{$1$2}")
		.replace(/\\textrm\{([^{}]+)\}\s*\\textrm\{([^{}]+)\}/gi, " \\textrm{$1 $2}")
		.replace(/\\textrm\{(.*?)\}\: /gi, " \\textrm{$1: }");

	if (output === input) {
		// Se não houver mais alterações, retorne o resultado
		const output2 = output
			.replace(/\\textrm\{(.*?) ?\} ?\| ?\\textrm\{ ?(.*?)\}/g, "\\textrm{$1 }|\\textrm{ $2}")
			.replace(/\\'e \\textrm\{(.*?)\}/g, "\\textrm{\\'e $1}")
			.replace(/\\textrm\{(.*?)\} \\'e /g, "\\textrm{$1 \\'e}")
			.replace(/\\textrm\{(\w+) ?\}(\\[a-z]+)\\textrm\{ ?(\w+)\}/gi, "\\textrm{$1} $2 \\textrm{$3}")
			.replace(/\\textrm{ }/gi, " ")
			.replace(/\\textrm\{e /g, "\\textrm{ e ")
			.replace(/\\textrm\{(sen|cos|tag) \}\^\{(\d)\}/gi, "\\textrm{$1}^{$2}\\,")
			.replace(/\\textrm\{(.*?) \} ?(\=|\+|\-|\\geq|\\cdot|\\rightarrow|\\Rightarrow|\\Delta|\\neq|\\ell|\\Omega|\\cup|\\cap|\\simeq)/gi, "\\textrm{$1} $2")
			.replace(/(\=|\+|\-|\\geq|\\cdot|\\rightarrow|\\Rightarrow|\\Delta|\\neq|\\ell|\\Omega|\\cup|\\cap|\\simeq) ?\\textrm\{ /gi, "$1 \\textrm{")
			.replace(/\, ?\\textrm\{logo/gi, ", \\textrm{ logo")
			.replace(/(\^|\_)\{\\textrm\{([a-z]+)\}\}/gi, "$1{\\textrm{$2}}\\;")
			.replace(/\\overline\{ \\textrm\{(.*?)\: \}\}\\textrm\{/gi, "\\overline{ \\textrm{$1}}\\textrm{: ")
			.replace(/\\textrm\{(\w+) \}\\right\)/g, "\\textrm{$1}\\right)")
			.replace(/\\textrm\{([^}]* (?:de|e))\}/g, "\\textrm{$1 }")
			.replace(/\\textrm{R }\\\$/gi, "\\textrm{R}\\$");
		return output2;
	} else {
		// Se houver alterações, chame a função recursivamente com o novo resultado
		return textLatex(output);
	}
}

function latex(str) {
	text = str
		.replace(/<p\s?>/gi, "")
		.replace(/<p/gi, "")
		.replace(/<\/p>/gi, "")
		.replace(/<font\s?>/gi, "")
		.replace(/<\/font>/gi, "")
		.replace(/<br>/gi, "")
		.replace(/\\bigm/gi, "")

		.replace(/\=/g, " = ")
		.replace(/\+/g, " + ")
		.replace(/≠/g, " ≠ ")
		.replace(/∶/g, " : ")
		.replace(/(d+)\-(d+)/g, "$1 – $2")

		.replace(/&amp;/g, "&")
		// .replace(/\.{3}|\\cdots/g, " \\cdots ") ????????
		.replace(/\\\.|·|⋅|\\bullet|\\cdot\b/g, " \\cdot ")
		.replace(/→|\\rightarrow\b/g, " \\rightarrow ")
		.replace(/⇒|\\Rightarrow\b/g, " \\Rightarrow ")
		.replace(/△|Δ|∆|\\Delta\b/g, " \\Delta ")
		.replace(/δ/g, " \\delta ")
		.replace(/θ|\\theta\b/g, " \\theta ")
		.replace(/ϕ|\\phi\b/g, " \\phi ")
		.replace(/𝜑|\\varphi\b/g, " \\varphi ")
		.replace(/≠|\\neq\b/g, " \\neq ")
		.replace(/≥|\\geq\b/g, " \\geq ")
		.replace(/≤|\\leq\b/g, " \\leq ")
		.replace(/∞|ထ/g, " \\infty ")
		.replace(/λ/g, " \\lambda ")
		.replace(/≅|\\cong/g, " \\cong ")
		.replace(/≈|\\approx/g, " \\approx ")
		.replace(/≃|\\simeq\b/g, " \\simeq ")
		.replace(/π|\\pi\b/g, " \\pi ")
		.replace(/μ|\\mu\b/g, " \\mu ")
		.replace(/ℓ/g, " \\ell ")
		.replace(/α/g, "\\alpha")
		.replace(/β/g, "\\beta")
		.replace(/Ω/g, " \\Omega ")
		.replace(/γ/g, "\\gamma")
		.replace(/∪/g, " \\cup ")
		.replace(/∩/g, " \\cap ")
		.replace(/×/g, " \\times ")
		.replace(/\\pm|±/g, " \\pm ")
		.replace(/\\in|∈/g, "\\in")
		.replace(/\\rightleftarrows|⇄/g, " \\rightleftarrows ")
		.replace(/(?<!\\)%/g, "\\%")
		.replace(/\\(mathbf|mathbit)/g, " \\textbf")
		.replace(/(?<!\$)\$(?!\$)/g, " \\$\\; ")
		.replace(/ *\$\$ */g, "$$$$")
		.replace(/⬚/g, " ")

		// .replace(/\\\\(?:\n)?\\end\{vmatrix\}/g, " \\end{vmatrix}")
		// .replace(/(?<!(?:\\\w+)|\}|\_|\^|\])\{(.*?)\}/g, "$1")
		.replace(/(?<!(?:\\\w+)|\}|\_|\^|\])\{([^\^\}]*)\}(?:\^|\_)(?!\w)( |\.|\,|:|;|!|\?|=|\+)/g, "$1$2")

		.replace(/√(\d+)/g, " \\sqrt{$1}")
		.replace(/°/g, " ^{\\circ}")
		.replace(/(\\rightarrow)/gi, " $1 ")

		.replace(/(?<!\\)(\d+)\\ (\d+)/g, "$1$2")
		.replace(/(?<!\\)\\ /g, " ")
		.replace(/\\prime|´/g, "'")

		.replace(/(\d+) (\d+)/g, "$1\\,$2")

		.replace(/\(\s*I\s*\)/g, "#1#")
		.replace(/\(\s*II\s*\)/g, "#2#")
		.replace(/\(\s*III\s*\)/g, "#3#")
		.replace(/\(\s*IV\s*\)/g, "#4#")
		.replace(/\(\s*V\s*\)/g, "#5#")
		.replace(/\(\s*VI\s*\)/g, "#6#")
		.replace(/\(\s*VII\s*\)/g, "#7#")
		.replace(/\(\s*VIII\s*\)/g, "#8#")

		.replace(/\\left\(\\begin\{matrix\}/gi, " \\begin{pmatrix} ")
		.replace(/\\end\{matrix\}\\right\)/gi, " \\end{pmatrix} ")

		.replace(/@■\(/gi, "@")
		// .replace(/(?<![■█┴#t])\(([^()<.]*)\)/gi, '#[$1]#')

		.replace(/\\buildrel(.*?)\\frac\\Rightarrow/g, " \\xrightarrow{$1} ")
		.replace(/(?:□\()?(?:⇒|\\Rightarrow\s)┴\((.*?)\)\)?/g, " \\xrightarrow{$1} ")

		.replace(/\{[█■]\((.*?)\)┤?/gi, " \\left\\{\\begin{matrix} $1 \\end{matrix}\\right. ")
		.replace(/\{[█■]\(([^\)]+)\)┤?/gi, " \\left\\{\\begin{matrix} $1 \\end{matrix}\\right. ")

		.replace(/(?<!@)\(■\((.*?)\)\)/gi, " \\begin{pmatrix} $1 \\end{pmatrix} ")
		.replace(/(?<!@)■\((.*?)\)/g, " \\begin{matrix} $1 \\end{matrix} ")

		.replace(/(?<!\\left)\\\{/g, " \\left\\{")
		.replace(/(?<!\\right)\\\}/g, " \\right\\}")
		.replace(/(?<!\\left)\\\[/g, " \\left [")
		.replace(/(?<!\\right)\\\]/g, " \\right ]")

		.replace(/(?<!\\left|\\right)\|/g, " | ")
		// .replace(/(?<!\\left)\|(.*?)\|/g, " \\left| $1\\right| ")

		// .replace(/(_|\^)(?![a-zA-Z0-9{])/gi, " ")

		.replace(/_(?![{}()<.\-\+\\]|\\(?:Rightarrow|rightarrow))([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç0-9]+)/g, "_{$1}")
		.replace(/\<sub\>(.*?)\<\/sub\>/g, "_{$1}")

		.replace(/¹/g, "^1")
		.replace(/²/g, "^2")
		.replace(/³/g, "^3")
		.replace(/ª/g, "^a")
		.replace(/º/g, "^o")
		.replace(/\^(?![{}()<.\-\+\\]|\\(?:Rightarrow|rightarrow))([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç0-9]+)/g, "^{$1}")
		.replace(/\<sup\>(.*?)\<\/sup\>/g, "^{$1}")

		.replace(/(?<!Dia \d?)(#\[.*?\]|[a-z\d]+)\/(#\[.*?\]|[a-z\d]+)/gi, " \\frac{$1}{$2} ")

		// .replace(/#\[([^#]*)\]#/gi, '\\left( $1 \\right)')
		// .replace(/(?<!\\left)\(([^#[]*)\)/gi, '\\left( $1 \\right)')
		.replace(/(?<!\\left)\((.*?(?:[^(]))\)/gi, " \\left( $1 \\right) ")

		.replace(/\\frac\{((?:\\left\()?.*?(?:\\right\))?)\}\{((?:\\left\()?.*?(?:\\right\))?)\}/gi, " \\frac{$1}{$2} ")

		.replace(/(?<![t])\)/gi, "")
		.replace(/[┤■■]/gi, "")
		.replace(/□\(/gi, "")

		.replace(/#1#/g, "\\; (I)")
		.replace(/#2#/g, "\\; (II)")
		.replace(/#3#/g, "\\; (III)")
		.replace(/#4#/g, "\\; (IV)")
		.replace(/#5#/g, "\\; (V)")
		.replace(/#6#/g, "\\; (VI)")
		.replace(/#7#/g, "\\; (VII)")
		.replace(/#8#/g, "\\; (VIII)")

		.replace(/@/g, " \\\\\n")

		.replace(/\\begin\{pmatrix\}/g, "\n\\begin{pmatrix}")
		.replace(/\\left\\\{\\begin\{matrix\}/g, "\n\\left\\{\\begin{matrix}")
		.replace(/\\begin\{matrix\}/g, "\n\\begin{matrix}")
		.replace(/\\end\{pmatrix\}/g, "\n\\end{pmatrix}")
		.replace(/\\end\{matrix\}\\right\./g, "\n\\end{matrix}\\right.")
		.replace(/\\end\{matrix\}/g, "\n\\end{matrix}")
		.replace(/(?<!\\)det/gi, " \\det ")
		.replace(/underline/g, "overline")
		.replace(/\\\\/g, "\\\\ ")

		.replace(/[ ]{2,}/gi, " ")
		.replace(/(\\\; ?)+/gi, "\\;")

		.replace(/(?<=\d)(?=(\d{3})+(?!\d))/g, "\\,")
		.replace(/(\d),(\d)/g, "$1,\\!$2")
		.replace(/(?<=(?:\d| |^)(?:kg|g|u|dm|mm|cm|m|ml|l))\s*(2|3)\b/gi, "^{$1}")

		// .replace(/(\\(?:\'|\~|\^).)|\\c\{c\}/g, (match) => nLatexAcentuacao[match])

		// .replace(/(?<!\\|\\textrm\{|\\textrm\{ |\\textbf\{|\\textbf\{ |\\begin\{|\\begin\{ |\\end\{|\\end\{ |\{\\color\{|\{\\color\{ )(?<=\d|\b| )([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç ]+)/g, "\\textrm{$1}")
		// .replace(/\\textrm\{(kg|g|u|dm|mm|cm|m|ml|l)\}/g, " \\textrm{ $1}")
		// .replace(/\\textrm\{(sen|cos|tag)\}/g, " \\textrm{$1 }")

		.replace(/[ ]{2,}/gi, " ");
	// .replace(/\\\;\\textrm\{ /g, " \\textrm{ ")
	// .replace(/\\textrm\{(e|de) ?\}/g, " \\textrm{ $1 }")
	// .replace(/(?<=\\textrm\{R\} \\\$\\\;)( ?\d+)\\;(\d+(?:,\d+)?)/gi, "$1.$2")
	// .replace(/[áéíóúçãõâêô]/g, (match) => latexAcentuacao[match])

	return text;
}

function convertCodecogsToMathcha(text) {
	text = semTag(text);
	// text = textLatex(text);
	text = text.replace(/(\\(?:\'|\~|\^).)|\\c\{c\}/g, (match) => nLatexAcentuacao[match]);
	text = textNLatex(text);

	text = text
		.replace(/[ ]{2,}/gi, " ")
		.replace(/ (?=[_^])/g, "")
		.replace(/(?<!\\(?:\w+|\$|\^|_))(?<=(?:[A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç| ]+))\s(?!\\left|\\right|\\end|\(|\)|\}|\]|\\|\*|\-|\+|\.|\=|\^|_|:|\$)/g, "\\ ")
		.replace(/\{\\color\{Red\}([^}]*)\}/gi, "$1")
		.replace(/(?<!\\|\w|[({]) (e|a|ou|de|da)\b/g, "\\ $1")
		.replace(/$(e|a|ou|de|da)\s/g, "$1\\ ")
		.replace(/(?<=\d) (?=\w)/gi, "\\ ")
		.replace(/(?<=[A-Za-z])\ \,/gi, ",")
		.replace(/(\d),(\d)/g, "$1,\\!$2")
		.replace(/\\ (?=\\right|$)/gi, "")
		.replace(/(?<!\\)\\ (?![a-zA-Z]|\d|\\end)/g, "")
		.replace(/(?<![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[ (=>]|\$\$)-|–(?![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[ )=<]|\$\$)/g, "\\ –\\ ")
		.replace(/(?<![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[=>,])-|–(?![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[)=<])/g, "–")
		.replace(/;/g, ";\\ ")
		.replace(/\{(?:\\ )?–(?:\\ )?/g, "{–")
		.replace(/ *\$\$ */g, "$$$$")
		.replace(/(\\ ){2,}/g, "$1");
	return text;
}

function removeQuebrasParagrafos(text) {
	if (document.getElementById("nLatex").checked) {
		text = nLatex(text);
	}
	if (document.getElementById("removePontoLista").checked) {
		text = text.replace(/•|● ?/gi, "");
	}
	text = text
		.replace(/<p>/gi, "")
		.replace(/<\/p>/gi, "\n")
		.replace(/<div>/gi, "")
		.replace(/<\/div>/gi, "\n")
		.replace(/\n(\()/g, " $1")
		.replace(/\n([a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]+)/g, " $1")
		.replace(/<br>/gi, "")
		.replace(/\n$/gi, "");
	return text;
}

function alternativasAlexandria(text) {
	text = text.replace(/([A-E])\s(.+)/g, (_, letter, text) => {
		return `\t<div class="editable-option clearfix none" style="top: 0px; display: block">\n\t\t<div class="dropdown">\n\t\t\t<a class="btn options-menu" data-toggle="dropdown" aria-expanded="false"></a>\n\t\t\t<ul class="dropdown-menu">\n\t\t\t\t<li><a class="edit">Editar</a></li>\n\t\t\t\t<li><a class="edit-justification">Justificativa</a></li>\n\t\t\t\t<li><a class="move-up">Mover para cima</a></li>\n\t\t\t\t<li><a class="move-down">Mover para baixo</a></li>\n\t\t\t\t<li><a class="remove">Remover</a></li>\n\t\t\t</ul>\n\t\t</div>\n\t\t<div class="justification none"></div>\n\t\t<div class="radio radio-success">\n\t\t\t<label><input type="radio" name="option" value="1" /><span class="circle"></span><span class="check"></span></label>\n\t\t</div>\n\t\t<div class="content"><p>${text.trim()}</p></div>\n\t</div>`;
	});
	text = `<div class="options clearfix">\n${text}</div>`;
	return text;
}



function nLatex(str) {
	let text = textNLatex(str);
	text = text
		.replace(/(?=\\\w)/gi, " ")
		.replace(/\\bigm/gi, "")
		.replace(/(?:(?<![a-v(=>]{3,})|(?<=<p>[a-zA-Z]{1,2}))\=/g, " = ")
		.replace(/(?<![>{])\+/g, " + ")
		.replace(/÷/g, " ÷ ")
		.replace(/→/g, " → ")
		.replace(/·|⋅|\\bullet|\\cdot\b/g, " · ")
		.replace(/⇒/g, " ⇒ ")
		.replace(/\\triangle|△|Δ/g, "Δ")
		.replace(/≠/g, " ≠ ")
		.replace(/⬚/g, " ")

		.replace(/&amp;/g, "&")
		.replace(/\\(?:le|leq)(?=\b|\d)/gi, "≤")
		.replace(/\\(?:ge|geq)(?=\b|\d)/gi, "≥")

		.replace(/\{([^}]*)\}(?:\^|_)(?!\w)( |\.|\,|:|;|!|\?|=|\+)/g, "$1$2")
		.replace(/\{([^}]*)\}(\^|_)/g, "$1$2")

		.replace(/R\s*\\?\s*\$/g, "R$ ")
		.replace(/¹/g, "<sup>1</sup>")
		.replace(/²/g, "<sup>2</sup>")
		.replace(/³/g, "<sup>3</sup>")
		.replace(/ª/g, "<sup>a</sup>")
		.replace(/º|°/g, "<sup>o</sup>")
		.replace(/₂/g, "<sub>2</sub>")
		.replace(/(?<=[0-9])(kg|g|u|dm|mm|cm|m|ml|l|mol)\b/gi, " $1")
		.replace(/\b(kg|g|u|dm|mm|cm|m|ml|l)(\d+)/g, "$1<sup>$2</sup>")
		.replace(/(?<=\d)(a|o) /g, "<sup>$1</sup> ")

		.replace(/\\(;| |,)/g, " ")
		.replace(/\\geq\b/g, " ≥ ")
		.replace(/\\cdot\b|\\cdot(?=\d)/g, " · ")
		.replace(/\\rightarrow\b/g, " → ")
		.replace(/\\longrightarrow\b/g, " ⟶ ")
		.replace(/\\Rightarrow\b|\\𝑅𝑖𝑔ℎ𝑡𝑎𝑟𝑟𝑜𝑤\b/g, " ⇒ ")
		.replace(/\\Delta\b|[∆]/g, "Δ")
		.replace(/ϕ|\\phi\b/g, "ϕ")
		.replace(/\\delta\b/g, "δ")
		.replace(/\\neq\b/g, " ≠ ")
		.replace(/\\ell\b/g, "ℓ")
		.replace(/\\alpha\b/g, "α")
		.replace(/\\beta\b/g, "β")
		.replace(/\\Omega\b/g, "Ω")
		.replace(/\\gamma\b/g, "γ")
		.replace(/\\cup\b/g, "∪")
		.replace(/\\cap\b/g, "∩")
		.replace(/\\theta\b/g, "θ")
		.replace(/\\varphi\b/g, "𝜑")
		.replace(/\\infty\b|∞/g, "ထ")
		.replace(/\\lambda/g, "λ")
		.replace(/\\prime|[´]/g, "'")
		.replace(/\\pm/g, "±")
		.replace(/\\in/g, "∈")
		.replace(/\\rightleftarrows|⇄/g, " ⇄ ")
		// .replace(/≅|\\cong/g, " ≅ ")
		// .replace(/≈|\\approx/g, " ≈ ")
		.replace(/≅|\\cong\b|≈|\\approx\b|≃|\\simeq\b/g, " ≃ ")
		.replace(/\\pi\b/g, "π")
		.replace(/\\mu\b/g, "μ")
		.replace(/×|\\times/g, "×")

		.replace(/\\mathrm\{(.*?)\}/g, "$1")
		.replace(/\\left\\?(\(|\{|\[)/g, "$1")
		.replace(/\\right\\?(\)|\}|\])/g, "$1")
		.replace(/(?<![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[ (=>,{]|(?!(?:eq|blo|mx)\d))-(?![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[ )=<])/g, " – ")
		.replace(/(?<![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[(=>]|(?!(?:eq|blo|mx)\d))-(?![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[)=<])/g, "–")
		.replace(/(?= )-(?=\d)/g, "–")
		.replace(/#\[([^[]*)\]/gi, "($1)")

		.replace(/_(?![{}()<.\-\+\\]|\\(?:Rightarrow|rightarrow))([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç0-9]+)/g, "<sub>$1</sub>")
		.replace(/\^(?![{}()<.\-\+\\]|\\(?:Rightarrow|rightarrow))([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç0-9]+)/g, "<sup>$1</sup>")

		.replace(/_\{([^{}<)]*)\}/gi, "<sub>$1</sub>")
		.replace(/\^\{([^{}<)]*)\}/gi, "<sup>$1</sup>")
		.replace(/(?<!R\$ )(?<=\d)(?=(\d{3})+(?!\d))/g, " ")
		.replace(/(?<=R\$ \d)(?=(\d{3})+(?!\d))/g, ".")
		.replace(/\{(.*?)\}\^ /g, "$1 ")
		.replace(/\( ?(.*?) ?\)/g, "($1)")
		.replace(/\\underline\{.*?\}/gi, "##")
		.replace(/;(?!\n|<| )/gi, "; ")
		.replace(/\\(?:right|left)([|()])/gi, "$1");
	// .replace(/(?<=\b[A-Za-z]) \(/g, "(")

	return text;
}

function facilidades(str) {
	let text = str;

	text = organizaTags(text);
	text = removeTag(text);
	text = removeImgFromParagraphs(text);
	if (!document.getElementById('naoVideo').checked) {
		text = replaceYoutubeLinks(text);
	}
	text = wrapTablesWithResponsiveDiv(text);
	text = convertTableCellsToHeaders(text);
	text = clearTableCell(text);
	text = formatLinks(text);
	text = fixMalformedLinks(text);
	if (document.getElementById('imgLacuna').checked) {
		text = imgLacunas(text);
	}
	// text = padraoFonte(text);

	return text;
}

function removeTag(html) {
	// Cria um elemento temporário e insere o HTML
	var tempDiv = $("<div>").html(html);

	// Remove tags <b>, <i>, <p> e <div> vazias
	tempDiv.find("b:empty, i:empty, p:empty, div:empty").remove();

	// Filtra e processa <b>, <i> e <div> que contenham apenas <br> ou espaços
	tempDiv
		.find("b, i, div")
		.filter(function () {
			var content = $(this).html().trim();
			return content === "<br>" || content === "<p><br></p>" || content === "";
		})
		.each(function () {
			// Substitui a tag <b>, <i> ou <div> pelo conteúdo relevante
			if ($(this).html().trim() === "<br>") {
				$(this).replaceWith("<br>");
			} else if ($(this).html().trim() === "<p><br></p>") {
				$(this).replaceWith("<p><br></p>");
			} else {
				$(this).remove(); // Remove a tag vazia
			}
		});

	// Remove tags <u> e <a> mas preserva o conteúdo
	tempDiv.find("u, a").contents().unwrap();

	// Retorna o HTML modificado
	return tempDiv.html();
}

function removeImgFromParagraphs(text) {
	return text.replace(/(<p>[\s\S]*?)(<img>)([\s\S]*?<\/p>)/gi, "$1$3<div class='mx-400 img-center'><img src='blo2-01.jpg'><div class='legend'><b>#$</b><br>Fonte: . Disponível em: <a href='##' class='url' target='_blank' rel='nofollow'>##</a>. Acesso em: .</div></div>");
}

function replaceYoutubeLinks(text) {
	return text.replace(/(<p>[\s\S]*?)(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+))([\s\S]*?<\/p>)/gi, "$1$4<div class='youtube'><div><div><iframe src='https://www.youtube.com/embed/$3?rel=0' frameborder='0' allowfullscreen=''></iframe></div></div></div><p class='d-none d-print-block'><span><a href='https://youtu.be/$3' target='blank' rel='nofollow' class='url'>https://youtu.be/$3</a></span></p>");
}

function wrapTablesWithResponsiveDiv(text) {
	return text.replace(/<table>(.*?)<\/table>/gi, "<div class='table-responsive mx-auto'><table class='data-table'>$1</table></div>");
}

function convertTableCellsToHeaders(text) {
	return text.replace(/(?<=<tbody>\s*<tr[^>]*>)(\s*<td>\s*<p(?:\s+class="text-center")?\s*><b>.*?<\/b>\s*<\/p>\s*<\/td>\s*)(?=<\/tr>)/gi, (match) => {
		return match.replace(/<td>\s*<p(?:\s+class="text-center")?\s*><b>(.*?)<\/b>\s*<\/p>\s*<\/td>/gi, "<th>$1</th>");
	});
}

function clearTableCell(text) {
	return (
		text
			// Remove apenas a classe, preservando outros atributos e evitando espaços extras
			.replace(/<(td|th)([^>]*)\s*\bclass=["'][^"']*["']([^>]*)>/gi, "<$1$2$3>")
			// Remove <p> dentro de <td> ou <th>, mantendo o conteúdo interno
			.replace(/<(td|th)([^>]*)>\s*<p>(.*?)<\/p>\s*<\/\1>/gi, "<$1$2>$3</$1>")
	);
}

function formatLinks(text) {
	return text.replace(/<a\s*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, (match, href, content) => {
		const url = href.trim();
		const innerText = content.trim();

		// Se o conteúdo do link for a própria URL, formata com as classes e atributos adicionais
		if (innerText === url) {
			return `<a href="${url}" class="url" target="_blank" rel="nofollow">${url}</a>`;
		} else {
			return `<a href="${url}" class="url" target="_blank" rel="nofollow">${innerText}</a>`;
		}
	});
}

function fixMalformedLinks(text) {
	const processedLinks = new Set();

	return text.replace(/\b((https?:\/\/|www\.)[^\s<>")]+[^\s<>.,;:")])/gi, (match, url) => {
		const cleanedUrl = url.replace(/\s+/g, "");
		if (processedLinks.has(cleanedUrl)) return match;

		const formattedLink = cleanedUrl.startsWith("www.") ? `https://${cleanedUrl}` : cleanedUrl;

		processedLinks.add(cleanedUrl);

		const safeUrl = escapeRegex(formattedLink);

		const isAlreadyLinked = new RegExp(`<a[^>]*href=["']?${safeUrl}["']?[^>]*>`, "i").test(match);

		return isAlreadyLinked ? match : `<a href="${formattedLink}" class="url" target="_blank" rel="nofollow">${cleanedUrl}</a>`;
	});

	function escapeRegex(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
}

function imgLacunas(text) {
	return text.replace(/_{9,}/gi, "<img src='linha.png' />").replace(/_{3,8}/gi, "<img src='lacuna.png' />");
}

function padraoFonte(text) {
	return text.replace(/<p>((?:<b>|<i>|<\/b>|<\/i>|[^<])+Disponível em:\s*<a[^>]*>.*?<\/a>.*?)<\/p>/gi, "<p class='text-right'>$1</p>");
}

function padraoResposta(text) {
	return text
		.replace(/<p>(?:Letra|Alternativa)[ :-]*([A-E])(?:(?!<\/p>)[\s\S])*?<\/p>\s*<p>(?:Resolução|Comentário)[ :-]*(?:<\/p>\s*<p>)?/gi, "<br><p><b>Resolução: $1</b><br><b>Comentário:</b> ")
		.replace(/<p>(?:Resolução: )?Letra ([A-E]) - /gi, "<br><p><b>Resolução: $1</b><br><b>Comentário:</b> ")
		.replace(/(?<=Resolução: )[a-e]/g, (match) => match.toUpperCase());
}

export function tagImg(html) {
	var tempDiv = $("<div>").html(html);
	[...tempDiv[0].querySelectorAll("p, div")].forEach((el) => {
		const isOnlyImg = el.children.length === 1 && el.children[0].tagName === "IMG" && el.textContent.trim() === "";

		const isAlreadyFormatted = el.classList.contains("img-center") || el.classList.contains("mx-600") || el.classList.contains("zoom");

		if (isOnlyImg && !isAlreadyFormatted) {
			el.outerHTML = `<div class="img-center mx-600 zoom">${el.innerHTML}</div>`;
		}
	});

	[...tempDiv[0].querySelectorAll("img")].forEach((img) => {
		const parent = img.parentElement;

		const isUnwrapped = ["P", "DIV"].includes(parent.tagName);
		const isOnlyChild = parent.childNodes.length === 1;
		const isNotFormatted = !(parent.classList.contains("img-center") || parent.classList.contains("mx-") || parent.classList.contains("zoom"));

		if (isUnwrapped && isOnlyChild && isNotFormatted) {
			img.outerHTML = `<div class="img-center mx-600 zoom">${img.outerHTML}</div>`;
		}
	});

	return tempDiv.html();
}

function fixOlStructure(tempHtml) {

	var tempDiv = $("<div>").html(tempHtml);

	const splitOl = (ol) => {
		var type = ol.getAttribute("type") || "1";
		var start = parseInt(ol.getAttribute("start") || "1", 10);

		// percorre os filhos
		var lis = Array.from(ol.querySelectorAll(":scope > li"));
		var expected = start;

		for (var i = 0; i < lis.length; i++) {
			var li = lis[i];

			// procura <ol start> logo abaixo do <li>
			var childOls = Array.from(li.querySelectorAll(":scope > ol[start]"));
			for (var j = 0; j < childOls.length; j++) {
				var childOl = childOls[j];
				var childStart = parseInt(childOl.getAttribute("start") || "1", 10);
				var childType = childOl.getAttribute("type") || "1";

				// se for o mesmo tipo e devia ser sequência, junta
				if (childType === type && childStart === expected + 1) {
					// mover todos os <li> do childOl para o ol atual
					while (childOl.firstElementChild) {
						ol.appendChild(childOl.firstElementChild);
					}
					childOl.remove();
				} else if (childType === type) {
					// precisa dividir
					var newOl = document.createElement("ol");
					newOl.setAttribute("start", String(childStart));
					newOl.setAttribute("type", childType);

					// mover os próximos irmãos do parent de childOl para o novo <ol>
					var liParent = childOl.parentElement;
					var moveFrom = liParent.nextElementSibling;
					while (moveFrom) {
						var next = moveFrom.nextElementSibling;
						newOl.appendChild(moveFrom);
						moveFrom = next;
					}

					// insere depois do ol atual
					ol.insertAdjacentElement("afterend", newOl);

					// recursivo no novo <ol>
					splitOl(newOl);
					return; // já dividiu, encerrar
				}
				expected = childStart;
			}
			expected++;
		}
	};

	Array.from(tempDiv[0].querySelectorAll("ol")).forEach(function (ol) {
		splitOl(ol);
	});

	return tempDiv.html();
}

function manual(str) {
	let text = str;

	text = fixOlStructure(text);
	text = alteraElementos(text);

	text = text
		.replace(/\.\/media\//gi, "")
		.replace(/<(\w) >/g, "<$1>")
		.replace(/<p> ?(<b>) ?/gi, "<p>$1")
		.replace(/<b><br><\/b>/gi, "<br>")
		.replace(/ ?<\/b> ?<b> ?/gi, " ")
		.replace(/\s*<br\s*\/?>\s*<\/b>/gi, "</b></p>\n<p>")
		.replace(/\s*<\/b>\s*<br\s*\/?>/gi, "</b></p>\n<p>")
		.replace(/\s*<br\s*\/?>\s*<b>/gi, "</p>\n<p><b>")
		.replace(/\s*<b>\s*<br\s*\/?>/gi, "</p>\n<p><b>")
		.replace(/(?<!<p>)(<br>)(<\/b>)?(<\/p>)/gi, "$2$3$1")
		.replace(/<(?!b)([\w]+)>\s*(?:<b>\s*)?(Atividades? Resolvidas?|Atividades de sala|Atividade de sala|Resolução de problemas?|Mão na massa|Vamos pesquisar|Cinefórum|Visita técnica|Ponto de partida|Conectando ideias|Exercícios de fixação|Exercício de fixação|Atividades de fixação|Atividade de fixação|Saiba mais|CNEC virtual|Texto e Contexto|Dialogando|Revise o que você aprendeu|Você é o autor|Momento pipoca|Pesquisar é Descobrir|Ler e Se Encantar, é Só Começar|Ler e se encantar é só começar|Revise o que aprendeu|Atividades Extras|Hora da leitura|Foco na Língua Portuguesa|Referências|Bibliografia|Compreensão do texto|Setting the scene|Speak up!|Reading Time|Activities|Let's review|Popcorn time|Did you know\?)(?:\s*<\/b>)?\s*<\/\1>/gi, "<hr>\n<h5><b>$2</b></h5><br>")
		.replace(/(?<![>])(Atividades? resolvidas?|Atividades de sala|Atividade de sala|Resolução de problemas?|Mão na massa|Vamos pesquisar|Cinefórum|Visita técnica|Conectando ideias|Ponto de partida)/gi, "<b>$1</b>")
		.replace(/<p>(?:\s?<b>\s?)?(?:Resolução Comentada|Resposta|Resolução)\s*:(?:\s?<\/b>\s?)?<\/p>/gi, "<br><p><b>Resolução comentada:</b></p>")
		.replace(/<p>(?:<b>)?(\d+)\s?[-.)](?![0-9])\s?(\d+)\s?[-.)](?![0-9])\s?(\d+)\s?[-.)](?![0-9])\s?(?:<\/b>)?\s?Professor, es(?:.*?)?<\/p>/gi, "<br><p><b>$1)</b>, <b>$2)</b> e <b>$3)</b> Professor, essas atividades encontram-se resolvidas no material didático. Sugerimos que as utilize durante as explicações do tema ao qual elas se referem a fim de aprofundar os conceitos abordados na parte teórica.</p>")
		.replace(/<p>(?:<b>)?(\d+)\s?[-.)](?![0-9])\s?(\d+)\s?[-.)](?![0-9])\s?(?:<\/b>)?\s?Professor, es(?:.*?)?<\/p>/gi, "<br><p><b>$1)</b> e <b>$2)</b> Professor, essas atividades encontram-se resolvidas no material didático. Sugerimos que as utilize durante as explicações do tema ao qual elas se referem a fim de aprofundar os conceitos abordados na parte teórica.</p>")
		.replace(/<p>(?:<b>)?(\d+)\s?[-.)](?![0-9])\s?(?:<\/b>)?\s?Professor, es(?:.*?)?<\/p>/gi, "<br><p><b>$1)</b> Professor, essa atividade encontra-se resolvida no material didático. Sugerimos que a utilize durante as explicações do tema ao qual ela se refere a fim de aprofundar os conceitos abordados na parte teórica.</p>")
		.replace(/<\/p>/gi, "</p>\n")
		.replace(/<b>([,.;:?!])?<\/b>/gi, "$1")
		.replace(/([,.;?!:])<\/b>/gi, "</b>$1")
		// .replace(/<p>(?:<br>)?(?:<b>)?(\d+)\s?[-.)](?![0-9])\s?(?:<b>)?(?:Resolução:|Resposta:|Resposta: Letra|Alternativa correta:|Resolução: Letra|Letra)?\s?([^<]*)?(?:<\/b>)?(.*?)?(?:<\/b>)?<\/p>/gi, "<br><p><b>$1)</b> $2$3</p>")
		.replace(/<p>(?:<br>)?(?:<b>)?\s*(\d{1,3})\s*[-.)]\s+(?![\d=+*/-])(?:<b>)?(?:Resolução:|Resposta:|Resposta: Letra|Alternativa correta:|Resolução: Letra|Letra)?\s*([^<]*)?(?:<\/b>)?(.*?)?(?:<\/b>)?<\/p>/gi, "<br><p><b>$1)</b> $2$3</p>")
		.replace(/<p><b>Questão 0?(\d)<\/b>\./gi, "<br><p><b>$1)</b> ")
		.replace(/<p>(?:<br>)?\s*(\d{1,3})\s*[-.)]\s+(?![\d=+*/-])(?:Resolução:|Resposta:|Resposta: Letra|Resolução: Letra|Letra)?([\s\S]*?)<\/p>/gi, "<br><p><b>$1)</b> $2</p>")
		.replace(/<ol><li>(?:<p>)?(?:<b>)?Resolução:\s?(?:<\/b>)(.*?)(?:<\/p>)?<\/li>\s*<\/ol>/gi, "<br><p><b>$$)</b> $1</p>")
		.replace(/(?<!<p>)<br><\/p>/gi, "</p>")
		.replace(/(?:<b>)?(Comentário:)(?:<\/b>)?/gi, "<br><b>Resolução comentada:</b> ")
		.replace(/<p><br><\/p>\s+(<br><p><b>Resolução comentada:<\/b><\/p>)/gi, "$1")
		.replace(/\s?<\/b>\s?<b>\s?/gi, " ")
		.replace(/<p>(?:<b>)(?:Competência Específica|Competência) (\d+)[:.]?(.*?)?(?:<\/b>)?[:]?(.*?)?(?:<\/b>)?<\/p>/gi, "<p><b>Competência Específica $1:</b> $2$3</p>")
		.replace(/<p>(?:Competência Específica|Competência) (\d+)[:.]?(.*?)?<\/p>/gi, "<p><b>Competência Específica $1:</b> $2</p>")
		.replace(/^(?:<hr>)/gi, "")
		.replace(/(<br>\s*)*$/gi, "")
		.replace(/<p><b>(\d+)\)/gi, "<br><p><b>$1)")
		.replace(/<p><b>Orientação\/Sugestão<\/b><\/p>/gi, "<p><b><br>Orientação e Sugestão</b></p>")
		.replace(/<br><p><b>(\d+)\)<\/b> (?:Resposta: Letra|Resposta:) /gi, "<br><p><b>$1)</b> ")
		.replace(/<p><b>([abcde]\))<\/b>/gi, "<p>$1")
		.replace(/<p><b><br>Orientação e Sugestão<\/b><\/p>\s?<br><p>/gi, "<p><b><br>Orientação e Sugestão</b></p><p>")
		.replace(/<p>([abcde]\))\s*(?:<b>)?\s*(?:Incorret|Errad)[ao][.,:]?\s*(?:<\/b>)?[.,:]?/gi, "<p>$1 <b>Incorreta.</b> ")
		.replace(/<p>([abcde]\))\s*(?:<b>)?\s*(?:corret|cert)[ao][.,:]?\s*(?:<\/b>)?[.,:]?/gi, "<p>$1 <b>Correta.</b> ")
		.replace(/<br>\s+<p><br>/gi, "<p><br>")
		.replace(/(?:<br>)?(?:<b>)?\((EM\d{2}[A-Z]{3}\d{3}|EM[A-Z]{4}\d{2}|EM[A-Z]{6}\d{2})\)(?:<\/b>)?/g, "<b>($1)</b>")
		.replace(/<p>(?:<br>)?<b>(\d+)\)<\/b>\./gi, "<br><p><b>$1)</b>")
		.replace(/<br><p><br>/gi, "<p><br>")
		.replace(/<(p|br)>Resolução: /gi, "<$1><b>Resolução:</b> ")
		.replace(/<p><b> ?Resolução:<\/b> ?(?:Resolução:)?/gi, "<p><b>Resolução:</b> ")
		.replace(/<ol><li><b>(.*?)<\/b><\/li><\/ol>/gi, "<h5>$1</h5>")
		.replace(/<br><p><b>0(\d)\)/gi, "<br><p><b>$1)")
		.replace(/(?<=<br><p><b>\d+\)<\/b>) Resolução:?/gi, "")
		.replace(/\s*(?:<br><p><\/p>|<br>)\s*(?=<p><b>\((?:EM\d{2}[A-Z]{3}\d{3}|EM[A-Z]{4}\d{2}|EM[A-Z]{6}\d{2})\))/g, "")
		.replace(/[ ]{2,}/gi, " ")
		.replace(/<ol>\s*<li>\s*(Trilha de aprendizagem|Objetivo de aprendizagem do capítulo|Situação-problema|Habilidades utilizadas nessa situação-problema:|Resolvendo a situação-problema)\s*<\/li>\s*<\/ol>/g, "<p><b>$1</b></p>")
		.replace(/<ul>\s*<li>\s*(<b>(?:Ao Educador|Resumo dos capítulos)<\/b>)\s*<\/li>\s*<\/ul>(\s*<br>)?/gi, "<p>$1</p>")
		.replace(/(?<=<p><b>Capítulo \d+(?::|-) ).*?(?=<\/b><\/p>)/gi, titulo)
		.replace(/Capítulo (\d+) ?(?::|-)/gi, "Capítulo $1 -")
		.replace(/(?<=<h5><b>).*?(?=<\/b><\/h5>)/gi, padronizarTitulo)
		.replace(/<p>\s*<b>\s*\d\.\d\.? .*?<\/b>.*?<\/p>/gi, subTitulo)
		.replace(/<\/h5>\s*<hr>\s*<h5>/gi, "</h5>\n<h5>")
		.replace(/<hr>\s*<hr>/gi, "<hr>")
		.replace(/<\/h5>\s*<br>\s*<p>/gi, "</h5>\n<p>")
		.replace(/<p>\s?(?:<b>)?\s?P(?:á|a)ginas?\s?\d+\s?(?:<\/b>)?\s?<\/p>/gi, "")
		.replace(/<div>\s*(.*?)\s*<\/div>/gi, "<p>$1</p>")
		.replace(/<br(?: \/)?>\s*<br(?: \/)?>/gi, "<br>")
		.replace(/\s?<\/b>\s?<b>\s?/gi, " ")
		.replace(/(?<!p>|div>)(?:<br>)?(<b>)(\d+\))\s*(<\/b>)/gi, "<p>$1$2$3</p>")
		.replace(/(?<=<p><b>\d+\)<\/b>)\s*<br\s*\/?>\s*(?=<img)/gi, "</p>\n<p>")
		.replace(/(?<=\))(?=\w)/gi, " ")
		.replace(/<\/h5>\s*<br\s*\/?>\s*<h5>/gi, "</h5>\n<h5>");

	const termos = ["Resposta pessoal", "Respostas pessoais", "Resposta circunstancial", "Respostas circunstanciais", "Observação", "Resposta esperada"];

	termos.forEach((term) => {
		// Cria um padrão que aceita qualquer quantidade de espaços entre as palavras
		const escapedTerm = term.replace(/\s+/g, "\\s+"); // ex: "Resposta\\s+pessoal"

		const patternTag = new RegExp(`<b>\\s*${escapedTerm}\\s*<\\/b>`, "gi");
		const patternPlain = new RegExp(`(?<!<b[^>]*?>\s*)${escapedTerm}(?=\s*[.:!?])`, "gi");

		text = text
			.replace(patternTag, `<b>${term}</b>`)
			.replace(patternPlain, `<b>${term}</b>`)
			.replace(/\s?<\/b>\s?<b>\s?/gi, " ");
	});

	text = tagImg(text);

	return text;
}

function subTitulo(str) {
	const newStr = str.match(/<p>\s*<b>\s*\d\.\d\.?\s*(.*?)<\/b>(.*?)<\/p>/i);

	if (!newStr) return str; // se não encontrar, retorna original

	const tituloTexto = titulo(newStr[1]);
	const extraTexto = newStr[2] || "";

	return `<hr><h5><b>${tituloTexto}</b>${extraTexto}</h5>`;
}

function padronizarTitulo(titulo) {
	const limpo = titulo.trim().replace(/\s+/g, " ");
	for (const [regex, padrao] of padroes) {
		if (regex.test(limpo)) return padrao;
	}
	return titulo; // retorna original se nenhum padrão for encontrado
}

function titulo(str) {
	let output = str.toLowerCase().trim();

	if (document.getElementById("titleIniMausc").checked) {
		output = output
			.replace(/(^\s*\p{L}|\.\s*\p{L})/gu, (match) => match.toUpperCase()) // primeira letra da frase
			.replace(/\b\p{L}{4,}\b/gu, (match) => match.charAt(0).toUpperCase() + match.slice(1));
	} else {
		output = output.replace(/(^\s*[\p{L}])|([.!?]\s*[\p{L}])/gu, (match) => match.toUpperCase());
	}

	return output;
}

function semTag(str) {
	return str
		.replace(/<br ?(?:\/)?>/gi, "\n")
		.replace(/<(?:\/)?(?:b|i|u|p|font)\s?.*?>/gi, "")
		.replace(/[ ]{2,}/gi, " ");
}

function removeParagrafosBr(tempDiv) {
	// Remove <p><br></p> ou <br> antes de uma lista ordenada <ol>
	tempDiv
		.find("ol")
		.prev("p")
		.each(function () {
			if ($(this).html().trim() === "<br>") {
				$(this).remove();
			}
		});

	// Remove <p><br></p> ou <br> antes do primeiro item de lista com a classe "list-item"
	tempDiv
		.find(".list-item")
		.prev("p")
		.each(function () {
			if ($(this).html().trim() === "<br>") {
				$(this).remove();
			}
		});
}

function listaOrdenada(text) {
	let tempDiv = $("<div>");
	tempDiv.html(text);

	// Seleciona todos os parágrafos
	let paragraphs = tempDiv.find("p");
	let $newTag = null;
	let itemsToRemove = [];

	paragraphs.each(function () {
		let paragraph = $(this);
		let texto = paragraph.text().trim();

		// Verifica se o parágrafo é um item de lista numerada
		if (texto.match(/^\d+\.\s/)) {
			if (document.getElementById("listaOrdenada").checked) {
				// Cria uma nova lista ordenada se ainda não existe uma ativa
				if ($newTag === null) {
					$newTag = $("<ol></ol>");
				}

				// Remove o número e adiciona o item à lista
				let listItem = texto.replace(/^\d+\.\s+/, "");
				$newTag.append("<li>" + listItem + "</li>");
				paragraph.addClass("remover");
			} else {
				if ($newTag === null) {
					$newTag = $("<p></p>");
				}
				if ($newTag.is("p") && $newTag.html().trim() === "") {
					$newTag.append(texto);
				} else {
					$newTag.append("<br>" + texto);
				}

				paragraph.addClass("remover");
			}
		} else {
			// Se o parágrafo não for um item de lista, finalize a lista anterior (se houver)
			if ($newTag !== null) {
				itemsToRemove[itemsToRemove.length - 1].after($newTag);
				$newTag = null;
			}

			// Adiciona o parágrafo ao resultado final
			itemsToRemove.push(paragraph);
		}
	});

	// Finaliza a última lista, se houver
	if ($newTag !== null) {
		itemsToRemove[itemsToRemove.length - 1].after($newTag);
	}

	// Remove os parágrafos originais que foram convertidos para lista
	tempDiv.find(".remover").remove();

	// Retorna o HTML modificado
	return tempDiv.html();
}

function processarListaOrdenada(text) {
	let tempDiv = $("<div>"); // Cria um elemento div temporário
	tempDiv.html(text); // Insere o texto HTML no div

	const paragraphs = tempDiv.find("p"); // Seleciona todos os parágrafos
	let listaItems = [];
	let listaEncontrada = false;
	let resultadoHTML = "";

	// Regex para identificar os itens do tipo "I - ..., II - ..."
	const regexRomanos = /^(I{1,3}|IV|V|VI{0,3}|IX|X{0,3})\s?(?:-|\.)\s/;
	const checkboxChecked = document.getElementById("listaOrdenada").checked;

	paragraphs.each(function (index, p) {
		// Uso de `each` do jQuery para iterar sobre os parágrafos
		let texto = $(p).html().trim();

		if (regexRomanos.test(texto)) {
			listaEncontrada = true;
			if (checkboxChecked) {
				listaItems.push(`<li>${texto.replace(regexRomanos, "")}</li>`);
				$(p).html(""); // Remove o conteúdo original do parágrafo
			} else {
				// Verifica se não é o primeiro parágrafo
				if (listaItems.length > 0) {
					listaItems.push(`<br>${texto.replace(/<\/?p>/, "")}`); // Adiciona <br> no início do conteúdo
				} else {
					listaItems.push(`${texto.replace(/<\/?p>/, "")}`); // Adiciona <br> no início do conteúdo
				}
			}
		} else {
			if (listaEncontrada && listaItems.length > 0) {
				console.log({ checkboxChecked }, "teste");

				if (checkboxChecked) {
					resultadoHTML += `<ol type="I">${listaItems.join("")}</ol>`;
					console.log(listaItems, "asdfasdf");
				} else {
					resultadoHTML += `<p>${listaItems.join("")}</p>`;
					console.log(listaItems, "asdfasdf");
				}
				listaItems = [];
				listaEncontrada = false;
			}
			resultadoHTML += $("<div>").append($(p).clone()).html(); // Clona e converte o elemento para string HTML
		}
	});
	console.log({ listaEncontrada }, { listaItems }, "teste");
	// Caso a lista esteja no final do texto
	if (listaEncontrada && listaItems.length > 0) {
		if (checkboxChecked) {
			resultadoHTML += `<ol type="I">${listaItems.join("")}</ol>`;
		} else {
			resultadoHTML += `<p>${listaItems.join("")}</p>`;
		}
	}

	// Retorna o novo HTML processado
	return resultadoHTML;
}

function removeListaOrdenada(text) {
	let tempDiv = $("<div>");
	tempDiv.html(text);

	const listItems = tempDiv.find(".list-item, list-item-I");

	const newText = listItems
		.map((i, item) => $(item).text())
		.get()
		.join("<br>");
	listItems.first().html(newText).removeClass("list-item, list-item-I");
	listItems.slice(1).remove();

	return tempDiv.html();
}

function exerciciosMaterial(str) {
	let text = str
		.replace(/<p>\s?(?:<b>)?\d+ ?[.)-](?:\s?<b>|\s?<\/b>| )*(.*?)(?:<\/b>)?\s?<\/p>/gi, '<div class="exercise"><p>$1</p></div>')
		.replace(/(?<=<div class="exercise"><p>)(\([^)]*\))(?:\s-\s)?/gi, "<b>$1</b> ")
		.replace(/Enem/gi, "ENEM")
		.replace(/(?:<p><br><\/p>|<br>|\s)*(<\/div>)(?:<p><br><\/p>|<br>|\s)*(<ol class="options">)/gi, "$1$2");
	text = padraoResposta(text);

	return text;
}

function exerciciosFundamental1(str) {
	let text = str
		.replace(/<p>\s?(?:<b>)?\d+ ?[.)-](?:\s?<b>|\s?<\/b>| )*(.*?)(?:<\/b>)?\s?<\/p>/gi, '<div class="exercise exercise-circle"><p>$1</p></div>')
		.replace(/(?<=<div class="exercise"><p>)(\([^)]*\))(?:\s-\s)?/gi, "<b>$1</b> ")
		.replace(/ X /g, " <b>X</b> ");
	text = padraoResposta(text);

	return text;
}

function destacarRespostaCorreta($exercise) {
	// Encontra a lista de opções (mais flexível)
	let $options = $exercise.nextAll("ol.options").first();

	if ($options.length > 0) {
		try {
			// Extrai a resposta correta com tratamento de erros
			let resolutionText = $options.find('p:contains("Resolução:")').text().trim();
			let correctAnswer = resolutionText.match(/Resolução:\s*([A-E])/i)[1];
			let indexMap = { A: 0, B: 1, C: 2, D: 3, E: 4 };
			let correctIndex = indexMap[correctAnswer.toUpperCase()];

			// Encontra a <li> correta e envolve seu conteúdo em <b>
			let $correctLi = $options.find("li").eq(correctIndex);
			$correctLi.html("<b>" + $correctLi.html() + "</b>");
		} catch (error) {
			console.log(`Erro ao processar o exercício: \n${$exercise.text().slice(0, 50)}`);
		}
	}
}

function exerciciosResolvidos(str) {
	let text = str
		.replace(/<p>(?:<b>)?[a-e]\)(?:<\/b>)? (.*?)<\/p>/gi, '<ol class="options"><li>$1</li></ol>')
		.replace(/(?<=<\/li>)<\/ol>\s*<ol class="options">(?=<li>)/gi, "")
		.replace(/(?<=<div class="exercise">)((?:(?!<div class="exercise">)[\s\S])*?)<\/div>((?:(?!<div class="exercise">)[\s\S])*?)(?=<ol class="options"><li>)/gi, "$1$2</div>")
		.replace(/(<ol class="options">)([\s\S]*?)(<\/ol>)([\s\S]*?)(?:(?=<div class="exercise">)|$)/gi, "$1$2$4$3");

	let tempDiv = $("<div>");
	tempDiv.html(text);

	// Itera sobre cada bloco de exercício
	tempDiv.find(".exercise").each(function () {
		destacarRespostaCorreta($(this));
	});

	// Extrai o HTML modificado de volta para a string
	return tempDiv.html();
}

function exerciciosH5p(str) {
	let text = str
		.replace(/<p>(?:<b>)?[a-e]\)(?:<\/b>)? (.*?)<\/p>/gi, '<div class="d-print-none"><!-- h5p --></div><div class="d-none d-print-block"><ol class="options"><li>$1</li></ol></div>')
		.replace(/(?<=<\/li>)<\/ol><\/div>\s*<div class="d-print-none">\s*<!-- h5p --><\/div><div class="d-none d-print-block"><ol class="options">(?=<li>)/gi, "")
		.replace(/(?<=<div class="exercise">)((?:(?!<div class="exercise">)[\s\S])*?)<\/div>((?:(?!<div class="exercise">)[\s\S])*?)(<div class="d-print-none"><!-- h5p --><\/div>)(?=<div class="d-none d-print-block"><ol class="options"><li>)/gi, "$1$2$3</div>");

	let tempDiv = $("<div>");
	tempDiv.html(text);

	// Remove o parágrafo <p><br></p>, <p><b>Resolução: [A-E]</b></p> e o <p><b>Comentário:</b> ...</p>
	tempDiv.find('p:contains("Resolução:")').each(function () {
		let $resolucaoPar = $(this);

		// Remove todas as tags <p><br></p> que precedem o parágrafo da resolução
		$resolucaoPar.prevAll("p").each(function () {
			if ($(this).html().trim() === "<br>") {
				$(this).remove();
			} else {
				return false; // Para o loop se encontrar um <p> que não seja <p><br></p>
			}
		});
	});
	tempDiv.find('p:contains("Resolução:")').next('p:contains("Comentário:")').remove(); // Remove <p><b>Comentário:</b> ...</p>
	tempDiv.find('p:contains("Resolução:")').remove(); // Remove <p><b>Resolução: [A-E]</b></p>

	// Extrai o HTML modificado de volta para a string
	text = tempDiv.html();

	text.replace(/(\s*(?:<p><br><\/p>|<br>)\s*)+/gi, "<p><br></p>");
	// .replace(/(\s*<p><br><\/p>\s*)+(?=<div class="exercise">)/gi, "$1")

	return text;
}

function _clear(str) {
	let text = str
		.replace(/\t/g, "")
		.replace(/\n/g, " ")
		.replace(/\s+/g, " ")
		.replace(/%20/g, "")
		.replace(/<!--[\s\S]*?-->/g, " ")
		.replace(/&#160;|(&nbsp;)+|(&quot;)+|<o:p>|<\/o:p>/gi, " ")
		.replace(/[\u201C\u201D]/g, '"')
		.replace(/[\u2061\u200b\u202c]/g, "")
		.replace(/’/g, "'")
		.replace(/‘/g, "'")
		.replace(/–/g, "-")
		.replace(/∙/g, " · ")
		.replace(/\s+(!|\?|\.|\,)/g, "$1 ")
		.replace(/[ ]{2,}/gi, " ")
		.replace(/&lt;\s*(?=<a)/gi, " ")
		.replace(/(<\/a>)\s*&gt;/gi, "$1 ")
		// .replace(/(<(?:\/)?(?!b|i|u|span)[^>]*>) (<(?:\/)?(?!b|i|u|span)[^>]*>)/gi, "$1$2")

		.replace(/(<(\w+)\s+style="[^"]*font-weight:\s*700[^"]*"[^>]*>)(.*?)(<\/\2>)/gi, "$1<b>$3</b>$4")
		.replace(/(<(\w+)\s+style="[^"]*font-weight:\s*bolder[^"]*"[^>]*>)(.*?)(<\/\2>)/gi, "$1<b>$3</b>$4")
		.replace(/(<span\s+.*?style="[^"]*font-weight:\s*bold[^"]*"[^>]*>)(.*?)(<\/span>)/gi, "$1<b>$2</b>$3")
		.replace(/(<(\w+)\s+class="[^"]*\s*Bold[^"]*"[^>]*>)(.*?)(<\/\2>)/gi, "<b>$3</b>")
		.replace(/<strong>(.*?)<\/strong>/gi, "<b>$1</b>")

		.replace(/(<(\w+)\s+style="[^"]*font-style:\s*italic[^"]*"[^>]*>)(.*?)(<\/\2>)/gi, "$1<i>$3</i>$4")
		.replace(/<em>(.*?)<\/em>/gi, "<i>$1</i>")
		.replace(/(<(\w+)\s+style="[^"]*text-decoration-line:\sunderline[^"]*"[^>]*>)(.*?)(<\/\2>)/gi, "$1<u>$3</u>$4")
		.replace(/(<(\w+)\s+style="[^"]*text-decoration:underline[^"]*"[^>]*>)(.*?)(<\/\2>)/gi, "$1<u>$3</u>$4")

		.replace(/(<(\w+)\s+[^>]*margin-left\s*:\s*(?:\d{3,})\s*(?:px)?[^>]*>)(.*?)(<\/\2>)/gi, "<blockquote>$3</blockquote>")
		.replace(/(<(\w+)\s+[^>]*vertical-align\s*:\s*(sub|sup)[^>]*>)(.*?)(<\/\2>)/gi, "<$3>$4</$3>")
		.replace(/<p[^>]*style="[^"]*text-align:\s*right[^"]*"[^>]*>/gi, '<p class="text-right">')
		.replace(/<p[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>/gi, '<p class="text-center">')
		.replace(/<ol[^>]*>\s?<li[^>]*list-style-type: ?upper-alpha;[^>]*>/gi, '<ol type="A"><li>')
		.replace(/<ol[^>]*>\s?<li[^>]*list-style-type: ?lower-alpha;[^>]*>/gi, '<ol type="a"><li>')

		.replace(/style="[^"]*?"(?!><\/iframe>)/gi, "")

		.replace(/<(?!a)(\w+)\s*(?![^>]*\b(?:class\s*=\s*["']?\s*(?:text-danger|text-center|data-table|table-responsive|mx-auto|text-right|legend|url|img-center|img-right|img-left|box-item|d-none|d-print-block|d-print-none|youtube|box-book|mx-\d+|row|col-sm-\d+)\b|type="[1aAiI]"|colspan="\d"|rowspan="\d"|src="|exercise|exercise-circle|options|list-item|student-only|teacher-only|teacher-gap|balao|caixinha|caixinhax|linha|lacuna|espaco))[^>]*>/gi, "<$1>")

		.replace(/\<b\b[^>]*\>/gi, "<b>")
		.replace(/\<li\b[^>]*\>/gi, "<li>")

		.replace(/(?<!<div class="youtube">|<div class="youtube"> |<div class="youtube">\n\t|<div class="youtube">\n|<div class="youtube">\t)<div>(\s*(?:(<div>.*?<\/div>)+?)\s*)<\/div>/gi, "$1")

		.replace(/\<li><p>(.*?)<\/p><\/li>/gi, "<li>$1</li>")
		.replace(/\<\/ul> ?<ul>/gi, "")
		.replace(/\<\/ol> ?<ol>/gi, "")

		.replace(/\<h1\b[^>]*\>(.*?)<\/h1>/gi, "<p><b>$1</b></p>")

		.replace(/\<div><table>(.*?)<\/table><\/div>/gi, "<table>$1</table>")
		.replace(/\<blockquote><table>(.*?)<\/table><\/blockquote>/gi, "<table>$1</table>")

		.replace(/<colgroup>.*?<\/colgroup>/gi, "")
		.replace(/(\s*<br>\s*)+/gi, "<br>")
		.replace(/(<p>\s*<\/p>)+/gi, "")
		.replace(/<p><br>(?!<\/p>)/gi, "<br><p>")
		.replace(/(\s*<p><br><\/p>\s*)+/gi, "<p><br></p>")
		.replace(/(?:<b>)+(.*?)( )?(?:<\/b>)+/gi, "<b>$1</b>$2")

		.replace(/<b>(\s|<br>)*<\/b>/gi, "$1")
		.replace(/<b><\/b>/gi, "")
		.replace(/<\/b>(\s*)<b>/gi, "$1")
		.replace(/<div>(\s|<br>)*<\/div>/gi, "$1")

		// .replace(/<img\b[^>]*>/gi, "<img>")

		.replace(/<v:shape(.*?)>(.*?)<\/v:shape>/gi, "##")
		.replace(/\s+/g, " ")

		.replace(/\b(?!\.)cnec(?!\.)\b/gi, "CNEC")

		.replace(/(\<a\b[^>]*\>)<u>(.*?)<\/u><\/a>/gi, "$1$2</a>")

		.replace(/\((Figura \d+)\)/gi, "(<b>$1</b>)")

		.replace(/[〖〗]/g, "")
		.replace(/&amp;/g, "&")
		.replace(/<p>(?:\s*)<\/p>/g, "")
		// .replace(/<p>(?:\s*)(?:<br>)*(?:\s*)<\/p>/gi, "\n")
		.replace(/(<div class="box-book">)(.*?)(?:<br>)?<\/div>/gi, "\n$1\n\t$2</div><br>\n")
		.replace(/alt=""/gi, "")
		.replace(/class="_idGenObjectAttribute-\d+"/gi, "")
		.replace(/[ ]{2,}/gi, " ")
		.replace(/<p> ?(<b>) ?/gi, "<p>$1")
		.replace(/<b><br><\/b>/gi, "<br>")
		.replace(/(?<!<p>)(<br>)(<\/b>)?(<\/p>)/gi, "$2$3$1");
	text = removeSpan(text);
	text = removeTag(text);

	return text;
}

function insereQuebras(textareaValue) {
	let text = textareaValue
		.replace(/\s+/g, " ")
		.replace(/ <(\/)?(p|div|ol|ul|li|td|tr)/gi, "<$1$2")
		.replace(/(?<!<tr><td>|<td>)<(div|h1|h2|h5|p|table|tr|\/tr|td|th|blockquote|script|iframe|\/div|ol|ul|hr)([^>]*)>/gi, "\n<$1$2>")
		.replace(/<((?:\/(?:div|h1|h2|h5|p|table|tr|ol|li|ul|blockquote))|(?:ol|ul|hr)[^>]*)>(?!<\/td>)/gi, "<$1>\n")
		.replace(/\n{2,}/gi, "\n")
		.replace(/<(li|script|iframe|tr|\/tr)([^>]*)>/gi, "\t<$1$2>")
		.replace(/(<tr>|<\/td>|<\/th>)\n<(td|th)([^>]*)>/gi, "$1\n\t\t<$2$3>")
		.replace(/ \n/gi, "\n")
		.replace(/<\/(ol|ul|table|blockquote|div)>/gi, "</$1>\n")
		.replace(/(<div class="legend">)/gi, "\t$1")
		.replace(/(<div class="youtube">)/gi, "$1\n\t")
		.replace(/(<div class='d-print-none'>)/gi, "\n$1\n\t")
		.replace(/<p><br>/gi, "\n<p><br>")
		.replace(/(?<=<\/ol>)\s*<br>\s*(?=<\/div>)/gi, "\n")
		.replace(/<p[^>]*>\s*<\/p>/gis, "")
		.replace(/(?<=\$\$)(?=\$\$)/g, "\n");
	return text;
}

function organizaTags(textareaValue) {
	let text = textareaValue
		.replace(/<font\s?>/gi, "")
		.replace(/<\/font>/gi, "")
		.replace(/ class="\s*"/gi, "")
		.replace(/ <\/(i|b|u)>/gi, "</$1> ")
		.replace(/(Acesso em|Disponível em) /gi, "$1: ")
		.replace(/(?<=(?:Acesso em|Disponível em):)(?=\w)/gi, " ")
		.replace(/Acesso em: 0(\d)/gi, "Acesso em: $1")
		.replace(/(?<!<i>)\bet al\.?/gi, "<i>et al.</i>")
		.replace(/(?:<b>)+(.*?)( )?(?:<\/b>)+/gi, "<b>$1</b>$2")
		.replace(/ \./gi, ".")
		.replace(/[ ]{2,}/gi, " ")
		.replace(/ <\/p>/gi, "</p>")
		.replace(/<p[^>]*> /gi, "<p>")
		.replace(/<p><\/p>/gi, "")
		.replace(/<br><p><b>(\d+)\)<\/b> Letra /gi, "<br><p><b>$1)</b> ")
		.replace(/<br>\n+?<p><br><\/p>/gi, "\n<p><br></p>")
		.replace(/<br>\s+(<p><br>)/gi, "\n$1")
		.replace(/\n{2,}/gi, "\n\n")
		.replace(/ \n/g, "\n")
		.replace(/<\/p>\n{2}<p>(?!<br>)/g, "</p>\n<p>")
		.replace(/<p><br><\/p>\n+(?=<p><br><b>\d+\)<\/b>)/g, "")
		.replace(/:<\/b> ?:/gi, ":</b>")
		.replace(/<div><br>\s?<\/div>\s?<br>/gi, "");

	if (document.getElementById("trocaTagImg").checked) {
		// .replace(/<img\s+src="(?!balao)[^"]*"\s+(?:(?:width|height)="[^"]*"\s*)+>/gi, "@@")
		text = text
			.replace(/<img\s+src="(?!balao|caixinha|caixinhax|linha|lacuna|espaco)[^"]*"(?:\s+\w+="[^"]*")*\s+(?:width|height)="[^"]*"(?:\s+\w+="[^"]*")*\s*>/gi, "@@")
			.replace(/@@((?:<br\s*\/?>)?(?:<\/b>)?<\/p>)/gi, "$1@@")
			.replace(/<img width="\d+".*?v:shapes=".*?">/gi, "##")
			.replace(/<img(?!(?:[^>]*\bsrc=['"](eq|blo|balao|caixinha|caixinhax|linha|lacuna|espaco)))[^>]*>/gi, "@@")
			.replace(/<p>(?:<b>)?(?:<br\s*\/?>)?@@(?:<br\s*\/?>)?(?:<\/b>)?<\/p>/gi, "@@");
	}

	text = text
		.replace(/^\s*/g, "")
		.replace(/(<br>\s*)*$/gi, "")
		.replace(/(?:<br><\/p>\s*)$/gi, "</p>")
		.replace(/(?:\s*<p><\/p>\s*)$/gi, "")
		.replace(/<a id=".*?"><\/a>/gi, "");
	return text;
}

function clear() {
	try {
		// Obter o texto do editor de texto
		var textareaValue = $("#summernote").summernote("code");

		if (document.getElementById("latex").checked) {
			textareaValue = textareaValue.replace(/<(\w+)[^>]*(?:color: ?rgb\(255, ?0, ?0\);|color:#ff0000;).*?>(.*?)<\/\1>/gi, "{\\color{Red}$2}");
		}
		if (document.getElementById("exerciciosFundamental1").checked) {
			textareaValue = textareaValue
				.replace(/<p[^>]*class="[^"]*\btextos_titulos\b[^"]*"[^>]*>([\s\S]*?)<\/p>/gi, "<h5>$1</h5>")
				.replace(/<img[^>]*\bsrc=['"][^'"]*Atividade_Oral[^'"]*['"][^>]*>/gi, "<img src='balao.png' height='35'> ")
				.replace(/<span[^>]*class="[^"]*\bNUM-EXERCICIO\b[^"]*"[^>]*>(\d+)\.<\/span>/gi, "<b>$1)</b> ")
				.replace(/<span[^>]*class="[^"]*\bCharOverride-(?:3|10)\b[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, "<i>$1</i> ")
				.replace(/<span[^>]*class="[^"]*\bLETRA-EXERCICIO\b[^"]*"[^>]*>([A-Z]\))<\/span>/gi, "$1 ")
				.replace(/<span[^>]*class="[^"]*\bCAIXA-RESPOSTA\b[^"]*"[^>]*>\s*C\s*<\/span>/gi, "<img src='caixinha.png' height='35'> ")
				.replace(/<[^>]*class="[^"]*\bMATERIAL-DIDATICO_BOX-ATIVIDADE\b[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi, "<div class='mx-900 zoom img-center'><img src='espaco.png'></div>")
				.replace(/<span[^>]*class="[^"]*\bCOR-PRINCIPAL\b[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,"<b>$1</b>");
		}

		if (document.getElementById("uperCase").checked) {
			textareaValue = upperCase(textareaValue);
		}

		// Limpar espaços, estilos e tags indesejados
		textareaValue = _clear(textareaValue);

		if (document.getElementById("latex").checked) {
			textareaValue = removerParenteses(textareaValue);
			textareaValue = latex(textareaValue);
			textareaValue = voltaParenteses(textareaValue);
			// textareaValue = textLatex(textareaValue);
			textareaValue = convertCodecogsToMathcha(textareaValue);
		}

		if (document.getElementById("nLatex").checked) {
			textareaValue = organizaTags(textareaValue);
			textareaValue = nLatex(textareaValue);
		}

		if (document.getElementById("manual").checked) {
			textareaValue = manual(textareaValue);
		}

		if (document.getElementById("listaOrdenadaSemOl").checked || document.getElementById("listaOrdenada").checked) {
			textareaValue = processarListaOrdenada(textareaValue);
			textareaValue = listaOrdenada(textareaValue);
			textareaValue = removeListaOrdenada(textareaValue);
		}

		if (document.getElementById("exerciciosMaterial").checked) {
			textareaValue = organizaTags(textareaValue);
			textareaValue = exerciciosMaterial(textareaValue);
			textareaValue = exerciciosH5p(textareaValue);
		}

		if (document.getElementById("exResolvidosMaterial").checked) {
			textareaValue = exerciciosMaterial(textareaValue);
			textareaValue = exerciciosResolvidos(textareaValue);
		}

		if (document.getElementById("exerciciosFundamental1").checked) {
			textareaValue = organizaTags(textareaValue);
			textareaValue = exerciciosFundamental1(textareaValue);
		}

		if (document.getElementById("latex").checked) {
			textareaValue = textareaValue
				.replace(/\n+/gi, " ")
				.replace(/[ ]{2,}/gi, " ")
				.replace(/^\s*/g, "")
				.replace(/(?<=\$\$) (?=\$\$)/g, "\n");
		}

		if (document.getElementById("removePontoLista").checked) {
			textareaValue = textareaValue.replace(/•|● ?/gi, "");
		}

		if (document.getElementById("facilidades").checked) {
			textareaValue = facilidades(textareaValue);
		}

		if (document.getElementById("semTag").checked) {
			textareaValue = semTag(textareaValue);
		}

		textareaValue = insereQuebras(textareaValue);

		// textareaValue = organizaTags(textareaValue);

		textareaValue = removeEspacosExtras(textareaValue);

		textareaValue = textareaValue
			.replace(/&lt;/gi, "<")
			.replace(/&gt;/gi, ">")
			.replace(/\n$/gi, "")
			.replace(/&amp;/g, "&")
			.replace(/(?:\n )$/gi, "")
			.replace(/(?<!<[a-zA-Z]+|\/[a-zA-Z]{1,4}|=|\n|\.|\/|"|>) ?(<|>) ?(?!\/[a-zA-Z]{1,4}>|[a-zA-Z]{1,4}|\/|\n|$)/gi, " $1 ")
			.replace(/R\s*\\?\s*\$/g, "R$ ")
			.replace(/(?<=<(?:[^>]*)) >/gi, ">")
			.replace(/(<table[^>]*>)\s+(<tbody>)/gi, "$1$2")
			.replace(/(<\/tbody>)\s+(<\/table>)/gi, "$1$2")
			.replace(/<a name="[^"]*"><\/a>/gi, "")
			.replace(/<h5>\s<b>/gi, "<h5><b>")
			.replace(/<br>\s+(<p><br>)/gi, "\n$1")
			.replace(/(?<=<br>)(?:\s+<br>)+/gi, "")
			.replace(/^(?:\n*<hr>\n*)/gi, "")
			.replace(/(?<=<hr>)\s+(?=<h5>)/gi, "\n")
			.replace(/(?<=<\/table>\s+)<br>\s+(?=<\/div>)/gi, "")
			.replace(/^\n/gi, "")
			.replace(/<br>\s*<br>/gi, "<br>")
			.replace(/^<br>\s?/gi, '');
		// Definir o texto formatado em outro elemento
		$("#result").text(textareaValue);

		// Definir o conteúdo da área editável como vazio
		// $('#summernote').summernote('empty');

		navigator.clipboard.writeText(textareaValue);
	} catch (error) {
		console.error("Erro ao formatar o texto:", error);
	}
}

function upperCase(textareaValue) {
	var tempDiv = $("<div>").html(textareaValue);

	tempDiv
		.find("*")
		.contents()
		.each(function () {
			if (this.nodeType === 3) {
				// Verifica se é um nó de texto
				this.nodeValue = this.nodeValue.toUpperCase();
			}
		});

	textareaValue = tempDiv.html();
	return textareaValue;
}

function limpaTela() {
	// Definir o conteúdo da área editável como vazio
	$("#summernote").summernote("empty");
	$("#result").text("");
}

function mathToHtml(p = false) {
	try {
		let textareaValueEq = $("#summernote").summernote("code");

		textareaValueEq = _clear(textareaValueEq);
		textareaValueEq = nLatex(textareaValueEq);
		textareaValueEq = semTag(textareaValueEq);
		textareaValueEq = textareaValueEq
			.replace(/&lt;/gi, " < ")
			.replace(/&gt;/gi, " > ")
			.replace(/[ ]{2,}/gi, " ")
			.replace(/^\s+|\s+$/g, "");

		if (p) textareaValueEq = `<p>${textareaValueEq}</p>`;

		// Definir o texto formatado em outro elemento
		$("#result").text(textareaValueEq);

		navigator.clipboard.writeText(textareaValueEq);
	} catch (error) {
		console.error("Erro ao formatar o texto:", error);
	}
}

$(document).ready(function () {
	// Inicializar o editor de texto
	$("#summernote").summernote({
		placeholder: "..",
		tabsize: 2,
		height: 350,
		toolbar: [["view", ["codeview"]]],
		callbacks: {
			onChange: function (contents, $editable) {
				$("#htmlView").val(contents);
			},
		},
	});

	// Atualiza o editor se o HTML for editado
	$("#htmlView").on("input", function () {
		$("#summernote").summernote("code", $(this).val());
	});

	// Quando o botão é clicado, formatar o texto e exibi-lo em outro elemento
	$("#clear").click(clear);

	$("#limpaTela").click(limpaTela);

	$("#eqGrande").click(function () {
		try {
			// Obter o texto do editor de texto
			var textareaValue = $("#result").text();

			// Limpar espaços, estilos e tags indesejados
			textareaValue = textareaValue.replace(/[ ]{2,}/gi, " ").replace(/^(.*?)$/g, "\\begin{matrix}$1\\end{matrix}");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValue);

			navigator.clipboard.writeText(textareaValue);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#eqTag").click(function () {
		try {
			clear();

			// Obter o texto do editor de texto
			var textareaValue = $("#result").text();

			// Limpar espaços, estilos e tags indesejados
			textareaValue = textareaValue.replace(/[ ]{2,}/gi, " ").replace(/^(.*?)$/g, "$$$$ $1 $$$$");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValue);

			navigator.clipboard.writeText(textareaValue);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#iniMaiusc").click(function () {
		try {
			// Obter o texto do editor de texto
			let textareaValue = $("#summernote").summernote("code");

			textareaValue = _clear(textareaValue);
			textareaValue = semTag(textareaValue);
			textareaValue = textareaValue.toLowerCase().replace(/\b[^ <>/]{4,}\b/g, (match) => match.charAt(0).toUpperCase() + match.slice(1));
			textareaValue = textareaValue.charAt(0).toUpperCase() + textareaValue.slice(1);

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValue);

			navigator.clipboard.writeText(textareaValue);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#eqHtml").click(function () {
		mathToHtml();
	});

	$("#eqHtmlP").click(function () {
		mathToHtml(true);
	});

	$("#textoSimples").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");

			textareaValueEq = _clear(textareaValueEq);
			textareaValueEq = semTag(textareaValueEq);
			textareaValueEq = textareaValueEq.replace(/[ ]{2,}/gi, " ");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#codecogsToMathcha").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");

			textareaValueEq = convertCodecogsToMathcha(textareaValueEq);

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#alternativasAlexandria").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");

			textareaValueEq = removeQuebrasParagrafos(textareaValueEq);
			textareaValueEq = alternativasAlexandria(textareaValueEq);

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#removeQuebras").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");

			textareaValueEq = removeQuebrasParagrafos(textareaValueEq);

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#removePantesOL").click(function () {
		try {
			let textareaValue = $("#summernote").summernote("code");

			textareaValue = textareaValue.replace(/<p>\s*(<ol[^>]*>\s*<li>)([\s\S]*?)<\/p>/gi, "$1$2</li></ol>").replace(/((<\/(li|ol|ul)>\n?){2,})$/gi, "");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValue);

			navigator.clipboard.writeText(textareaValue);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#removeCitacao").click(function () {
		try {
			let textareaValue = $("#summernote").summernote("code");

			textareaValue = textareaValue
				.replace(/(?:\n)?<\/?blockquote>/g, "")
				.replace(/&nbsp;/g, " ")
				.replace(/(?:\n|\t)+(?=<b>)/g, " ")
				.replace(/(?<=<p>)(?:\n|\t)+/g, "")
				.replace(/(?:\n|\t)+(?=<\/p>)/g, "")
				.replace(/(?<=<p>) (?=<b>)/g, "")
				.replace(/\t(?=<)/g, "")
				.replace(/[ ]{2,}/gi, " ")
				.replace(/\n\n/gi, "\n");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValue);

			navigator.clipboard.writeText(textareaValue);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#removeSpan").click(function () {
		try {
			let textareaValue = $("#summernote").summernote("code");

			textareaValue = removeSpan(textareaValue);
			textareaValue = textareaValue.replace(/&nbsp;/g, " ");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValue);

			navigator.clipboard.writeText(textareaValue);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#textUpperCase").click(function () {
		try {
			let textareaValue = $("#summernote").summernote("code");

			textareaValue = upperCase(textareaValue);

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValue);

			navigator.clipboard.writeText(textareaValue);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#circuit").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");

			textareaValueEq = circuit(textareaValueEq);

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#processarPDF").click(function () {
		try {
			rotaCount();
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#rota").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");

			textareaValueEq = rota(textareaValueEq);

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#ajustEqSalvaEq").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");

			textareaValueEq = semTag(textareaValueEq);
			textareaValueEq = textareaValueEq
				.replace(/&nbsp;/gi, " ")
				.replace(/&amp;/gi, "&")
				.replace(/'/gi, "'")
				.replace(/"/gi, "''")
				.replace(/\$\$ ?(.*?) ?\$\$/gi, '"$1",\n')
				.replace(/\\/gi, "\\\\")
				.replace(/[ ]{2,}/gi, " ")
				.replace(/\n\n/gi, "\n");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#imgSvg").click(function () {
		try {
			let textareaValueEq = $("#result").text() != "" ? $("#result").text() : $("#summernote").summernote("code");

			let counter = parseInt($("#numSvg").val(), 10);
			let bloco = $("#bloco").val();

			textareaValueEq = textareaValueEq.replace(/\<img src\=\"eqn?\d\-\d{0,3}\.svg\"\>/gi, "##").replace(/##/g, () => {
				let imageName = `eq${bloco}-${counter.toString().padStart(3, "0")}.svg`;
				counter++;
				return `<img src='${imageName}'>`;
			});

			$("#numSvg").val(counter);
			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard
				.writeText(textareaValueEq)
				.then(() => {
					console.log("Texto copiado com sucesso!");
				})
				.catch((err) => {
					console.error("Erro ao copiar o texto:", err);
				});
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	/*$("#imgJpgPng").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");
			let counter = parseInt($("#numImg").val(), 10);
			let bloco = $("#bloco").val();

			textareaValueEq = textareaValueEq
				.replace(/<p(?: class="text-center")?>(?:<b>\s?|\s)?@@(?:\s?<\/b>|\s)?<\/p>/gi, "@@")
				.replace(/(<div class="img-(?:center|left|right) mx-\d{3}">)?<img src="blo\d{1,2}\-\d{2,3}\.(jpg|png)"(?: \/)?>(?:<\/div)?/gi, "@@$1#$2")
				.replace(/@@/g, (match, offset, string) => {
					// Extrai o formato (jpg ou png) do nome da imagem original

					let formatMatch = string.slice(offset).match(/#(jpg|png)/i);
					let format = formatMatch ? formatMatch[1] : "jpg";

					let positionMatch = string.slice(offset).match(/<div class="img-(center|left|right) mx-\d{3}">/i);
					let position = positionMatch ? positionMatch[0] : "<div class='mx-400 img-center'>";

					// Construindo o nome da nova imagem
					let imageName = `blo${bloco}-${counter.toString().padStart(2, "0")}.${format}`;

					counter++;
					return `\n${position}<img src='${imageName}'></div>`;
				})
				.replace(/(?<=(?:jpg|png)'><\/div>)(<div class="img-(?:center|left|right) mx-\d{3}">)#(jpg|png)>/gi, "")
				.replace(/<p>(<div.*?<\/div>)<\/p>/gi, "$1")
				.replace(/\n+/gi, "\n")
				.replace(/#(?:jpg|png)/gi, "");

			$("#numImg").val(counter);
			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard
				.writeText(textareaValueEq)
				.then(() => {
					console.log("Texto copiado com sucesso!");
				})
				.catch((err) => {
					console.error("Erro ao copiar o texto:", err);
				});
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});*/

	$("#imgJpgPng").click(function () {
		try {
			let textareaValue = $("#result").text() != "" ? $("#result").text() : $("#summernote").summernote("code");

			let counter = parseInt($("#numImg").val(), 10);
			const bloco = $("#bloco").val();
			const tagsImg = document.getElementById("imgRound").checked ? " zoom overflow-hidden rounded-4" : "";

			// Tratamento para entradas com @@ ou blocos de imagem existentes
			textareaValue = textareaValue
				.replace(/<br \/>/gi, "<br>")
				.replace(/<p>(?:\s*@@\s*)<\/p>/g, "@@") // Remove parágrafos @@
				.replace(/<p>\s*(?:<br>\s*)<\/p>\s*(?=@@(?!\s*<div\s+class=['"]exercise))/g, "") // Remove parágrafos vazios antes @@
				.replace(/(@@)\s*<p>(?:\s*<br>\s*)<\/p>\s*(?!\s*<div\s+class=['"]exercise)/g, "$1") // Remove parágrafos vazios após @@
				.replace(/@@\s*<p[^>]*?>(Figura[\s\S]*?)<\/p>\s*<p[^>]*?>((?:Disponível em:|Fonte:)[\s\S]*?)<\/p>/gi, (match, caption1, caption2) => {
					// Formata um novo bloco de imagem quando @@ é encontrado com legenda
					const imageName = `blo${bloco}-${counter.toString().padStart(2, "0")}.jpg`;
					return `<div class='mx-400 img-center${tagsImg}'><img src='${imageName}'><div class='legend'><b>${caption1}</b><br>${caption2}</div></div>`;
				})
				.replace(/@@/gi, () => {
					// Formata um novo bloco de imagem quando @@ é encontrado sem legenda
					const imageName = `blo${bloco}-${counter.toString().padStart(2, "0")}.jpg`;
					return `<div class='mx-400 img-center${tagsImg}'><img src='${imageName}'></div>`;
				})
				.replace(/<img src=['"]blo\d{1,2}-\d{2,3}\.(jpg|png)['"]\s*\/?>/gi, (match, extension) => {
					// Reorganiza o nome das imagens, extraindo o tipo da imagem (jpg ou png)
					const imageName = `blo${bloco}-${counter.toString().padStart(2, "0")}.${extension}`;
					counter++;
					return `<img src='${imageName}'>`;
				});

			// Atualiza o contador de imagens
			$("#numImg").val(counter);

			// Atualiza o elemento de resultado
			$("#result").text(textareaValue);

			// Copia o texto para a área de transferência
			navigator.clipboard
				.writeText(textareaValue)
				.then(() => console.log("Texto copiado com sucesso!"))
				.catch((err) => console.error("Erro ao copiar o texto:", err));
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	// o seletor irá corresponder a todos os controles de entrada do tipo :checkbox
	// e anexar um manipulador de evento de clique
	$("input:checkbox").on("click", function () {
		// no manipulador, 'this' se refere à caixa clicada
		var $box = $(this);
		if ($box.is(":checked")) {
			// o nome da caixa é obtido usando o método .attr()
			// pois é assumido e esperado ser imutável
			var group = "input:checkbox[name='" + $box.attr("name") + "']";
			// o estado marcado do grupo/caixa, por outro lado, mudará
			// e o valor atual é obtido usando o método .prop()
			$(group).prop("checked", false);
			$box.prop("checked", true);
		} else {
			$box.prop("checked", false);
		}
	});
});
