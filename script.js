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

function removerParenteses(input) {
	const output = input.replace(/(?<![■█┴#_]|left)\(([^()<.]*)\)/gi, "#[$1]#");
	return output === input ? output : removerParenteses(output);
}

function voltaParenteses(input) {
	const output = input.replace(/\#\[([^#]*)\]\#/gi, "\\left( $1 \\right)");
	return output === input ? output : voltaParenteses(output);
}

function removeSpan(input) {
	const output = input.replace(/<span(?! class="d-none)[^<]*?>(?!<span)(.*?)<\/span>/gi, "$1");
	// const output = input.replace(/<span[^<]*?>(.*?[^<span>].*?)<\/span>/gi, "$1");
	return output === input ? output : removeSpan(output);
}

function textNLatex(input) {
	const output = input.replace(/(\^|_)\\textrm\{([^}]*)\}/gi, " $1$2 ").replace(/\\textrm\{([^}]*)\}/gi, " $1 ");
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
		.replace(/(?<!^|^ )\\textrm\{([^{}]*)\}(?: ?)\\textrm\{([^{}]*)\}/g, " \\textrm{$1 $2}")
		.replace(/\\textrm\{(.*?)\}\: /g, " \\textrm{$1: }");
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

		.replace(/\=/g, " = ")
		.replace(/\+/g, " + ")
		.replace(/≠/g, " ≠ ")
		.replace(/∶/g, " : ")
		.replace(/(d+)\-(d+)/g, "$1 – $2")

		.replace(/&amp;/g, " & ")
		// .replace(/\.{3}|\\cdots/g, " \\cdots ") ????????
		.replace(/·|⋅|\\bullet\b|\\cdot\b/g, " \\cdot ")
		.replace(/→|\\rightarrow\b/g, " \\rightarrow ")
		.replace(/⇒|\\Rightarrow\b/g, " \\Rightarrow ")
		.replace(/△|Δ|\\Delta\b/g, " \\Delta ")
		.replace(/δ/g, " \\delta ")
		.replace(/θ|\\theta\b/g, " \\theta ")
		.replace(/≠|\\neq\b/g, " \\neq ")
		.replace(/≥|\\geq\b/g, " \\geq ")
		.replace(/≤|\\leq\b/g, " \\leq ")
		// .replace(/≅|\\cong/g, " \\cong ")
		// .replace(/≈|\\approx/g, " \\approx ")
		.replace(/≅|\\cong\b|≈|\\approx\b|≃|\\simeq\b/g, " \\simeq ")
		.replace(/π|\\pi\b/g, " \\pi ")
		.replace(/μ|\\mu\b/g, " \\mu ")
		.replace(/ℓ/g, " \\ell ")
		.replace(/α/g, "\\alpha")
		.replace(/β/g, "\\beta")
		.replace(/Ω/g, " \\Omega ")
		.replace(/γ/g, "\\gamma")
		.replace(/∪/g, " \\cup ")
		.replace(/∩/g, " \\cap ")
		.replace(/(?<!\\)%/g, "\\%")
		.replace(/\\(mathbf|mathbit)/g, " \\textbf")
		.replace(/\$/g, " \\$\\; ")
		.replace(/⬚/g, " ")

		// .replace(/(?<!(?:\\\w+)|\}|\_|\^|\])\{(.*?)\}/g, "$1")
		.replace(/(?<!(?:\\\w+)|\}|\_|\^|\])\{([^\^\}]*)\}(?:\^|\_)(?!\w)( |\.|\,|:|;|!|\?|=|\+)/g, "$1$2")

		.replace(/√(\d+)/g, " \\sqrt{$1}")
		.replace(/°/g, " ^{\\circ}")
		.replace(/(\\rightarrow)/gi, " $1 ")

		.replace(/(?<!\\)(\d+)\\ (\d+)/g, "$1$2")
		.replace(/(?<!\\)\\ /g, " ")
		.replace(/\\prime/g, "'")

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

		.replace(/(_|\^)(?![a-zA-Z0-9{])/gi, " ")

		.replace(/_\(([^()<.\-\+\^\]#]*)\)/gi, "_{$1}")
		.replace(/_\(([^()<.\-\+\^\]#]*)\)/gi, "_{$1}")
		.replace(/_([^\s{}()<.\-\+\^\\Rightarrow\\rightarrow\]#]+)/gi, "_{$1}")
		.replace(/_([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]+)/g, "_{$1}")
		.replace(/\<sub\>(.*?)\<\/sub\>/g, "_{$1}")

		.replace(/¹/g, "^1")
		.replace(/²/g, "^2")
		.replace(/³/g, "^3")
		.replace(/ª/g, "^a")
		.replace(/º/g, "^o")
		.replace(/\^\(([^()<.\-\+_\]#]*)\)/gi, "^{$1}")
		.replace(/\^\(([^()<.\-\+_\]#]*)\)/gi, "^{$1}")
		.replace(/\^([^\s{}()<.\-\+_\\Rightarrow\\rightarrow\]#]+)/gi, "^{$1}")
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
		.replace(/(\\\; ?){2,}/gi, "\\;")

		.replace(/(?<=\d)(?=(\d{3})+(?!\d))/g, "\\,")
		.replace(/(\d),(\d)/g, "$1,\\!$2")
		.replace(/(?<=kg|g|u|dm|mm|cm|m|ml|l)(2|3)/gi, "^{$1}")

		.replace(/(\\(?:\'|\~|\^).)|\\c\{c\}/g, (match) => nLatexAcentuacao[match])

		.replace(/(?<!\\|\\textrm\{|\\textrm\{ |\\textbf\{|\\textbf\{ |\\begin\{|\\begin\{ |\\end\{|\\end\{ |\{\\color\{|\{\\color\{ )(?<=\d|\b| )([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç ]+)/g, "\\textrm{$1}")
		.replace(/\\textrm\{(kg|g|u|dm|mm|cm|m|ml|l)\}/g, " \\textrm{ $1}")
		.replace(/\\textrm\{(sen|cos|tag)\}/g, " \\textrm{$1 }")

		.replace(/[ ]{2,}/gi, " ")
		.replace(/\\\;\\textrm\{ /g, " \\textrm{ ")
		.replace(/\\textrm\{(e|de) ?\}/g, " \\textrm{ $1 }")
		.replace(/(?<=\\textrm\{R\} \\\$\\\;)( ?\d+)\\;(\d+(?:,\d+)?)/gi, "$1.$2")
		.replace(/[áéíóúçãõâêô]/g, (match) => latexAcentuacao[match]);

	return text;
}

function nLatex(str) {
	let text = textNLatex(str);
	text = text
		.replace(/(?<![a-v(=>]{3,})\=/g, " = ")
		.replace(/\+/g, " + ")
		.replace(/÷/g, " ÷ ")
		.replace(/→/g, " → ")
		.replace(/·|⋅|\\bullet\b|\\cdot\b/g, " · ")
		.replace(/⇒/g, " ⇒ ")
		.replace(/△|Δ/g, " Δ ")
		.replace(/≠/g, " ≠ ")
		.replace(/⬚/g, " ")

		.replace(/\{([^}]*)\}(?:\^|_)(?!\w)( |\.|\,|:|;|!|\?|=|\+)/g, "$1$2")
		.replace(/\{([^}]*)\}(\^|_)/g, "$1$2")

		.replace(/R ?\\?\$/g, "R$ ")
		.replace(/¹/g, "<sup>1</sup>")
		.replace(/²/g, "<sup>2</sup>")
		.replace(/³/g, "<sup>3</sup>")
		.replace(/ª/g, "<sup>a</sup>")
		.replace(/º/g, "<sup>o</sup>")
		.replace(/(?<=[0-9])(kg|g|u|dm|mm|cm|m|ml|l)\b/gi, " $1")
		.replace(/\b(kg|g|u|dm|mm|cm|m|ml|l)(\d+)/g, "$1<sup>$2</sup>")

		.replace(/\\(;| |,)/g, " ")
		.replace(/\\geq\b/g, " ≥ ")
		.replace(/\\cdot\b/g, " · ")
		.replace(/\\rightarrow\b/g, " → ")
		.replace(/\\Rightarrow\b/g, " ⇒ ")
		.replace(/\\Delta\b/g, " Δ ")
		.replace(/\\delta\b/g, "δ")
		.replace(/\\neq\b/g, " ≠ ")
		.replace(/\\ell\b/g, "ℓ")
		.replace(/\\alpha\b/g, "α")
		.replace(/\\beta\b/g, "β")
		.replace(/\\Omega\b/g, "Ω")
		.replace(/\\gamma\b/g, "γ")
		.replace(/\\cup\b/g, "∪")
		.replace(/\\cap\b/g, "∩")
		// .replace(/≅|\\cong/g, " ≅ ")
		// .replace(/≈|\\approx/g, " ≈ ")
		.replace(/≅|\\cong\b|≈|\\approx\b|≃|\\simeq\b/g, " ≃ ")
		.replace(/\\pi\b/g, "π")
		.replace(/\\mu\b/g, "μ")

		.replace(/\\mathrm\{(.*?)\}/g, "$1")
		.replace(/\\left\\?(\(|\{|\[)/g, "$1")
		.replace(/\\right\\?(\)|\}|\])/g, "$1")
		.replace(/(?<![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[ (=>])-(?![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[ )=<])/g, " – ")
		.replace(/(?<![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[(=>])-(?![a-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]{3,}|[)=<])/g, "–")
		.replace(/#\[([^[]*)\]/gi, "($1)")

		.replace(/_([^\s{}()<.\-\+\\Rightarrow\\rightarrow]+)/gi, "<sub>$1</sub>")
		.replace(/_([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]+)/g, "<sub>$1</sub>")
		.replace(/\^([^\s{}()<.\-\+\\Rightarrow\\rightarrow]+)/gi, "<sup>$1</sup>")
		.replace(/\^([A-Za-záéíóúàèìòùâêîôûäëïöüãẽĩõũç]+)/g, "<sup>$1</sup>")

		.replace(/_\{([^{}<)]*)\}/gi, "<sub>$1</sub>")
		.replace(/\^\{([^{}<)]*)\}/gi, "<sup>$1</sup>")
		.replace(/(?<!R\$ )(?<=\d)(?=(\d{3})+(?!\d))/g, " ")
		.replace(/(?<=R\$ \d)(?=(\d{3})+(?!\d))/g, ".")
		.replace(/\{(.*?)\}\^ /g, "$1 ")
		.replace(/\( ?(.*?) ?\)/g, "($1)");
	// .replace(/(?<=\b[A-Za-z]) \(/g, "(")

	return text;
}

function facilidades(str) {
	let text = str;
	text = text
		.replace(/(<p>[\s\S]*?)(<img>)([\s\S]*?<\/p>)/gi, "$1$3<div class='img-center mx-400 text-center'><img src='blo2-01.jpg'><div class='legend'><b>#$</b><br>Fonte: . Disponível em: <a href='##' class='url' target='_blank' rel='nofollow'>##</a>. Acesso em: .</div></div>")
		.replace(/(<p>[\s\S]*?)(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+))([\s\S]*?<\/p>)/gi, "$1$4<div class='youtube'><div><div><iframe src='https://www.youtube.com/embed/$3?rel=0' frameborder='0' allowfullscreen=''></iframe></div></div></div><p class='d-none d-print-block'><span><a href='https://youtu.be/$3' target='blank' rel='nofollow'>https://youtu.be/$3</a></span></p>")
		.replace(/<table>(.*?)<\/table>/gi, "<div class='table-responsive mx-auto'><table class='data-table'>$1</table></div>")
		.replace(/(?<=<tbody><tr>)(<td><p(?: class="text-center")?><b>.*?<\/b><\/p><\/td>)(?=<\/tr>)/, (match) => {
			return match.replace(/<td><p(?: class="text-center")?><b>(.*?)<\/b><\/p><\/td>/gi, "<th>$1</th>");
		})
		.replace(/<(a)\s*href="(.*?)".*?>(.*?)<\/\1>/gi, "<a href='$2' class='url' target='_blank' rel='nofollow'>$3</a>")
		.replace(/<a>(\s)?(.*?)(\s)?<\/a>/gi, "$1<a href='$2' class='url' target='_blank' rel='nofollow'>$2</a>$3")
		.replace(/(?<!["'>])\<?\b(https?:\/\/.*?\.(?:html?|pdf))(?!\.\w)\>?/gi, (match, link) => `${link.replace(/ /g, "")}`)
		.replace(/(?<!["'>])\b(https?:\/\/\S+\.(?:html?|pdf))(?!\.\w)\b/gi, "<a href='$1' class='url' target='_blank' rel='nofollow'>$1</a>");

	return text;
}

function manual(str) {
	let text = str;
	text = text
		.replace(/<(\w) >/g, "<$1>")
		.replace(/<p> ?(<b>) ?/gi, "<p>$1")
		.replace(/<(?!b)([\w]+)>\s*(?:<b>\s*)?(Atividades? Resolvidas?|Atividades de sala|Atividade de sala|Resolução de problemas?|Mão na massa|Vamos pesquisar|Cinefórum|Visita técnica|Ponto de partida|Conectando ideias)(?:\s*<\/b>)?\s*<\/\1>/gi, "<hr>\n<h5><b>$2</b></h5><br>")
		.replace(/(?<![>])(Atividades? resolvidas?|Atividades de sala|Atividade de sala|Resolução de problemas?|Mão na massa|Vamos pesquisar|Cinefórum|Visita técnica|Conectando ideias|Ponto de partida)/gi, "<b>$1</b>")
		.replace(/<p>(?:\s?<b>\s?)?(?:Resolução Comentada|Resposta|Resolução)\s*:(?:\s?<\/b>\s?)?<\/p>/gi, "<p><br><b>Resolução Comentada:</b></p>")
		.replace(/<p>(?:<b>)?(\d+)\s?[-.)](?![0-9])\s?(\d+)\s?[-.)](?![0-9])\s?(\d+)\s?[-.)](?![0-9])\s?(?:<\/b>)?\s?Professor, es(?:.*?)?<\/p>/gi, "<p><br><b>$1)</b>, <b>$2)</b> e <b>$3)</b> Professor, essas atividades encontram-se resolvidas no material didático. Sugerimos que as utilize durante as explicações do tema ao qual elas se referem a fim de aprofundar os conceitos abordados na parte teórica.</p>")
		.replace(/<p>(?:<b>)?(\d+)\s?[-.)](?![0-9])\s?(\d+)\s?[-.)](?![0-9])\s?(?:<\/b>)?\s?Professor, es(?:.*?)?<\/p>/gi, "<p><br><b>$1)</b> e <b>$2)</b> Professor, essas atividades encontram-se resolvidas no material didático. Sugerimos que as utilize durante as explicações do tema ao qual elas se referem a fim de aprofundar os conceitos abordados na parte teórica.</p>")
		.replace(/<p>(?:<b>)?(\d+)\s?[-.)](?![0-9])\s?(?:<\/b>)?\s?Professor, es(?:.*?)?<\/p>/gi, "<p><br><b>$1)</b> Professor, essa atividade encontra-se resolvida no material didático. Sugerimos que a utilize durante as explicações do tema ao qual ela se refere a fim de aprofundar os conceitos abordados na parte teórica.</p>")
		.replace(/<\/p>/gi, "</p>\n")
		.replace(/<p>(?:<br>)?(?:<b>)?(\d+)\s?[-.)](?![0-9])\s?(?:<b>)?(?:Resolução:|Resposta:|Resposta: Letra|Alternativa correta:|Resolução: Letra|Letra)?\s?([^<]*?)?(?:<\/b>)?(.*?)?(?:<\/b>)?<\/p>/gi, "<p><br><b>$1)</b> $2$3</p>")
		.replace(/<p><b>Questão 0?(\d)<\/b>\./gi, "<p><br><b>$1)</b> ")
		.replace(/<p>(?:<br>)?\s?(\d+)\s?[-.)](?![0-9])\s?(?:Resolução:|Resposta:|Resposta: Letra|Resolução: Letra|Letra)?\s?(.*?)?<\/p>/gi, "<p><br><b>$1)</b> $2</p>")
		.replace(/<ol><li>(?:<p>)?(?:<b>)?Resolução:\s?(?:<\/b>)(.*?)(?:<\/p>)?<\/li>\s*<\/ol>/gi, "<p><br><b>$$)</b> $1</p>")
		.replace(/(?<!<p>)<br><\/p>/gi, "</p>")
		.replace(/(Comentário:)/gi, "<br><b>Resolução comentada:</b> ")
		.replace(/<p><br><\/p>\s+(<p><br><b>Resolução comentada:<\/b><\/p>)/gi, "$1")
		.replace(/ ?<\/b> ?<b> ?/gi, " ")
		.replace(/<p>(?:<b>)(?:Competência Específica|Competência) (\d+)[:.]?(.*?)?(?:<\/b>)?[:]?(.*?)?(?:<\/b>)?<\/p>/gi, "<p><b>Competência Específica $1:</b> $2$3</p>")
		.replace(/<p>(?:Competência Específica|Competência) (\d+)[:.]?(.*?)?<\/p>/gi, "<p><b>Competência Específica $1:</b> $2</p>")
		.replace(/^(?:<hr>)/gi, "")
		.replace(/(<br>\s*)*$/gi, "")
		.replace(/<p><b>(\d+)\)/gi, "<p><br><b>$1)")
		.replace(/<p><b>Orientação\/Sugestão<\/b><\/p>/gi, "<p><b><br>Orientação e Sugestão</b></p>")
		.replace(/<p><br><b>(\d+)\)<\/b> (?:Resposta: Letra|Resposta:) /gi, "<p><br><b>$1)</b> ")
		.replace(/<p><b>([abcde]\))<\/b>/gi, "<p>$1")
		.replace(/<p><b><br>Orientação e Sugestão<\/b><\/p>\s?<p><br>/gi, "<p><b><br>Orientação e Sugestão</b></p><p>")
		.replace(/<p>([abcde]\))\s*(?:<b>)?\s*(?:Incorret|Errad)[ao][.,:]?\s*(?:<\/b>)?[.,:]?/gi, "<p>$1 <b>Incorreta.</b> ")
		.replace(/<p>([abcde]\))\s*(?:<b>)?\s*(?:corret|cert)[ao][.,:]?\s*(?:<\/b>)?[.,:]?/gi, "<p>$1 <b>Correta.</b> ")
		.replace(/<br>\s+<p><br>/gi, "<p><br>")
		.replace(/(?:<br>)?(?:<b>)?\((EM\d{2}[A-Z]{3}\d{3}|EM[A-Z]{4}\d{2}|EM[A-Z]{6}\d{2})\)(?:<\/b>)?/g, "<b>($1)</b>")
		.replace(/<p>(?:<br>)?<b>(\d+)\)<\/b>\./gi, "<p><br><b>$1)</b>")
		.replace(/<br><p><br>/gi, "<p><br>")
		.replace(/<(p|br)>Resolução: /gi, "<$1><b>Resolução:</b> ")
		.replace(/<p><b> ?Resolução:<\/b> ?(?:Resolução:)?/gi, "<p><b>Resolução:</b> ")
		.replace(/<ol><li><b>(.*?)<\/b><\/li><\/ol>/gi, "<h5>$1</h5>")
		.replace(/<p><br><b>0(\d)\)/gi, "<p><br><b>$1)")
		.replace(/(?<=<p><br><b>\d+\)<\/b>) Resolução:?/gi, "")
		.replace(/\s*(?:<p><br><\/p>|<br>)\s*(?=<p><b>\((?:EM\d{2}[A-Z]{3}\d{3}|EM[A-Z]{4}\d{2}|EM[A-Z]{6}\d{2})\))/g, "")
		.replace(/[ ]{2,}/gi, " ")
		.replace(/<ol>\s*<li>\s*(Trilha de aprendizagem|Objetivo de aprendizagem do capítulo|Situação-problema|Habilidades utilizadas nessa situação-problema:|Resolvendo a situação-problema)\s*<\/li>\s*<\/ol>/g, "<p><b>$1</b></p>");

	return text;
}

function semTag(str) {
	return str.replace(/<(?:\/)?(?:b|i|u|p|font|br)\s?.*?>/gi, " ").replace(/[ ]{2,}/gi, " ");
}

function exerciciosMaterial(str) {
	let text = str
		.replace(/<p>\s?(?:<b>)?\d+[.)-](?:\s?<b>|\s?<\/b>| )*(.*?)(?:<\/b>)?\s?<\/p>/gi, '<div class="exercise"><p>$1</p></div>')
		.replace(/\(Enem\)/gi, "<b>(ENEM)</b>")
		.replace(/<p>[a-e]\) (.*?)<\/p>/gi, '<div class="d-print-none"><!-- h5p --></div><div class="d-none d-print-block"><ol class="options"><li>$1</li></ol></div>')
		.replace(/(?<=<\/li>)<\/ol><\/div>\s*<div class="d-print-none">\s*<!-- h5p --><\/div><div class="d-none d-print-block"><ol class="options">(?=<li>)/gi, "")
		.replace(/(?<=<div class="exercise">)((?:(?!<div class="exercise">)[\s\S])*?)<\/div>((?:(?!<div class="exercise">)[\s\S])*?)(<div class="d-print-none"><!-- h5p --><\/div>)(?=<div class="d-none d-print-block"><ol class="options"><li>)/gi, "$1$2$3</div>");
	return text;
}

function _clear(str) {
	let text = str
		.replace(/\t/g, "")
		.replace(/\n/g, " ")
		.replace(/\s+/g, " ")
		.replace(/<!--[\s\S]*?-->/g, " ")
		.replace(/(&nbsp;)+|(&quot;)+|<o:p>|<\/o:p>/gi, " ")
		.replace(/[\u201C\u201D]/g, '"')
		.replace(/[\u2061\u200b\u202c]/g, "")
		.replace(/’/g, "'")
		.replace(/‘/g, "'")
		.replace(/–/g, "-")
		.replace(/×/g, "x")
		.replace(/∙/g, " · ")
		.replace(/\s+(!|\?|\.|\,)/g, "$1 ")
		.replace(/[ ]{2,}/gi, " ")
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

		.replace(/<(?!a)(\w+)\s*(?![^>]*\b(?:class\s*=\s*["']?\s*(?:text-danger|text-center|data-table|table-responsive|mx-auto|text-right|legend|url|img-center|img-right|img-left|box-item|d-none|d-print-block|d-print-none|youtube|box-book|mx-\d+|row|col-sm-\d+)\b|type="[1aAiI]"|colspan="\d"|rowspan="\d"|src="))[^>]*>/gi, "<$1>")

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
		.replace(/(\s*<p><br><\/p>\s*)+/gi, "<p><br></p>")
		.replace(/(?:<b>)+(.*?)( )?(?:<\/b>)+/gi, "<b>$1</b>$2")

		.replace(/<b>(\s|<br>)*<\/b>/gi, "$1")
		.replace(/<\/b>\s?<b>/gi, " ")
		.replace(/<b><\/b>/gi, "")
		.replace(/<div>(\s|<br>)*<\/div>/gi, "$1")

		// .replace(/<img\b[^>]*>/gi, "<img>")

		.replace(/<v:shape(.*?)>(.*?)<\/v:shape>/gi, "##")
		.replace(/\s+/g, " ")

		.replace(/\b(?!\.)cnec(?!\.)\b/gi, "CNEC")

		.replace(/(\<a\b[^>]*\>)<u>(.*?)<\/u><\/a>/gi, "$1$2</a>")

		.replace(/\((Figura \d+)\)/gi, "(<b>$1</b>)")

		.replace(/[〖〗]/g, "")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/<p>(?:\s*)<\/p>/g, "")
		// .replace(/<p>(?:\s*)(?:<br>)*(?:\s*)<\/p>/gi, "\n")
		.replace(/(<div class="box-book">)(.*?)(?:<br>)?<\/div>/gi, "\n$1\n\t$2</div><br>\n")
		.replace(/[ ]{2,}/gi, " ")
		.replace(/<p> ?(<b>) ?/gi, "<p>$1");
	text = removeSpan(text);
	return text;
}

function clear() {
	try {
		// Obter o texto do editor de texto
		var textareaValue = $("#summernote").summernote("code");

		if (document.getElementById("latex").checked) {
			textareaValue = textareaValue
				// .replace(/(?<!\\|\\textrm\{|\\textrm\{ |\\textbf\{|\\textbf\{ |\\begin\{|\\begin\{ |\\end\{|\\end\{ |\{\\color\{|\{\\color\{ |\\left)\\?\{([^{}<.]*)\\?\}/gi, '\\left\\{$1\\right\\}')
				.replace(/<(\w+)[^>]*(?:color: ?rgb\(255, ?0, ?0\);|color:#ff0000;).*?>(.*?)<\/\1>/gi, "{\\color{Red} $2}");
		}

		// Limpar espaços, estilos e tags indesejados
		textareaValue = _clear(textareaValue);

		if (document.getElementById("latex").checked) {
			textareaValue = removerParenteses(textareaValue);
			textareaValue = latex(textareaValue);
			textareaValue = voltaParenteses(textareaValue);
			textareaValue = textLatex(textareaValue);
		}

		if (document.getElementById("nLatex").checked) {
			textareaValue = nLatex(textareaValue);
		}

		if (document.getElementById("facilidades").checked) {
			textareaValue = facilidades(textareaValue);
		}

		if (document.getElementById("manual").checked) {
			textareaValue = manual(textareaValue);
		}

		if (document.getElementById("exerciciosMaterial").checked) {
			textareaValue = exerciciosMaterial(textareaValue);
		}

		textareaValue = textareaValue
			.replace(/\s+/g, " ")
			.replace(/[ ]{2,}/gi, " ")
			.replace(/ <(\/)?(p|div|ol|ul|li|td|tr)/gi, "<$1$2")
			.replace(/(?<!<tr><td>|<td>)<(div|h1|h2|h5|p|table|tr|\/tr|td|th|blockquote|script|iframe|\/div|ol|ul|hr)([^>]*)>/gi, "\n<$1$2>")
			.replace(/<((?:\/(?:div|h1|h2|h5|p|table|tr|ol|li|ul|blockquote))|(?:ol|ul|hr)[^>]*)>(?!<\/td>)/gi, "<$1>\n")
			.replace(/\n{2,}/gi, "\n")
			.replace(/<(li|script|iframe|tr|\/tr)([^>]*)>/gi, "\t<$1$2>")
			.replace(/(<tr>|<\/td>|<\/th>)\n<(td|th)>/gi, "$1\n\t\t<$2>")
			.replace(/ \n/gi, "\n")
			.replace(/<\/(ol|ul|table|blockquote|div)>/gi, "</$1>\n<br>\n")
			.replace(/(<div class="legend">)/gi, "\t$1")
			.replace(/(<div class="youtube">)/gi, "$1\n\t")
			.replace(/(<div class='d-print-none'>)/gi, "\n$1\n\t")
			.replace(/<p><br>/gi, "\n<p><br>")
			.replace(/(?<=<\/ol>)\s*<br>\s*(?=<\/div>)/gi, "\n")
			.replace(/<img\s+src="[^"]*"\s+(?:(?:width|height)="[^"]*"\s*)+>/gi, "@@")
			.replace(/<p>(?:<b>)?(?:<br\s*\/?>)?@@(?:<br\s*\/?>)?(?:<\/b>)?<\/p>/gi, "@@")
			.replace(/@@((?:<br\s*\/?>)?(?:<\/b>)?<\/p>)/gi, "$1@@");

		textareaValue = textareaValue
			.replace(/<font\s?>/gi, "")
			.replace(/<\/font>/gi, "")
			.replace(/ <\/(i|b|u)>/gi, "</$1> ")
			.replace(/(Acesso em|Disponível em) /gi, "$1: ")
			.replace(/Acesso em: 0(\d)/gi, "Acesso em: $1")
			.replace(/(?<!<i>)\bet al\./gi, "<i>et al.</i>")
			.replace(/(?:<b>)+(.*?)( )?(?:<\/b>)+/gi, "<b>$1</b>$2")
			.replace(/ \./gi, ".")
			.replace(/[ ]{2,}/gi, " ")
			.replace(/ <\/p>/gi, "</p>")
			.replace(/<p> /gi, "<p>")
			.replace(/<p><\/p>/gi, "")
			.replace(/<p><br><b>(\d+)\)<\/b> Letra /gi, "<p><br><b>$1)</b> ")
			.replace(/<br>\n+?<p><br><\/p>/gi, "\n<p><br></p>")
			.replace(/\n{2,}/gi, "\n\n")
			.replace(/ \n/g, "\n")
			.replace(/<\/p>\n{2}<p>(?!<br>)/g, "</p>\n<p>")
			.replace(/<p><br><\/p>\n+(?=<p><br><b>\d+\)<\/b>)/g, "")
			.replace(/:<\/b> ?:/gi, ":</b>")
			.replace(/<div><br>\s?<\/div>\s?<br>/gi, "")
			.replace(/<img width="\d+".*?v:shapes=".*?">/gi, "##")
			.replace(/^\s*/g, "")
			.replace(/(<br>\s*)*$/gi, "")
			.replace(/(?:<br><\/p>\s*)$/gi, "</p>")
			.replace(/(?:\s*<p><\/p>\s*)$/gi, "");

		if (document.getElementById("latex").checked) {
			textareaValue = textareaValue
				.replace(/\n+/gi, " ")
				.replace(/[ ]{2,}/gi, " ")
				.replace(/^\s*/g, "");
		}

		// Definir o texto formatado em outro elemento
		$("#result").text(textareaValue);

		// Definir o conteúdo da área editável como vazio
		// $('#summernote').summernote('empty');

		navigator.clipboard.writeText(textareaValue);
	} catch (error) {
		console.error("Erro ao formatar o texto:", error);
	}
}

$(document).ready(function () {
	// Inicializar o editor de texto
	$("#summernote").summernote({
		placeholder: "..",
		tabsize: 2,
		height: 110,
		toolbar: [["view", ["codeview"]]],
	});

	// Quando o botão é clicado, formatar o texto e exibi-lo em outro elemento
	$("#clear").click(clear);

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

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValue);

			navigator.clipboard.writeText(textareaValue);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#eqHtml").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");

			textareaValueEq = _clear(textareaValueEq);
			textareaValueEq = nLatex(textareaValueEq);
			textareaValueEq = semTag(textareaValueEq);
			textareaValueEq = textareaValueEq.replace(/[ ]{2,}/gi, " ").replace(/\s?(.*?)\s?/gi, "$1");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
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
			let textareaValueEq = $("#summernote").summernote("code");
			let counter = 1;
			let bloco = $("#bloco").val();

			textareaValueEq = textareaValueEq.replace(/\<img src\=\"eqn?\d\-\d{0,3}\.svg\"\>/gi, "##").replace(/##/g, () => {
				let imageName = `eq${bloco}-${counter.toString().padStart(3, "0")}.svg`;
				counter++;
				return `<img src='${imageName}'>`;
			});

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
		} catch (error) {
			console.error("Erro ao formatar o texto:", error);
		}
	});

	$("#imgJpgPng").click(function () {
		try {
			let textareaValueEq = $("#summernote").summernote("code");
			let counter = 1;
			let bloco = $("#bloco").val();

			textareaValueEq = textareaValueEq
				.replace(/<p(?: class="text-center")?>@@<\/p>/gi, "@@")
				.replace(/(<div class="img-(?:center|left|right) mx-\d{3} text-center">)?<img src="blo\d\-\d{2,3}\.(jpg|png)"(?: \/)?>(?:<\/div)?/gi, "@@$1#$2")
				.replace(/@@/g, (match, offset, string) => {
					// Extrai o formato (jpg ou png) do nome da imagem original

					let format = string.match(/(?<=@@)(?:(?:<div class="img-(?:center|left|right) mx-\d{3} text-center">)?#?(?:jpg|png))?/gi);

					console.log(format[counter - 1]);

					let imageName = `blo${bloco}-${counter.toString().padStart(2, "0")}.${format[counter - 1] != "" ? format[counter - 1].split("#")[1] : "jpg"}`;
					let _position = `${format[counter - 1] != "" ? format[counter - 1].split("#")[0] : "<div class='img-center mx-400 text-center'>"}`;

					counter++;
					return `\n${_position}<img src='${imageName}'></div>`;
				})
				.replace(/(?<=(?:jpg|png)'><\/div>)(<div class="img-(?:center|left|right) mx-\d{3} text-center">)#(jpg|png)>/gi, "")
				.replace(/<p>(<div.*?<\/div>)<\/p>/gi, "$1")
				.replace(/\n\n/gi, "\n");

			// Definir o texto formatado em outro elemento
			$("#result").text(textareaValueEq);

			navigator.clipboard.writeText(textareaValueEq);
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
