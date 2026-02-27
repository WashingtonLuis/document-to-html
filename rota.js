export function rota(text) {
	text = padronizaRota(text);
	return text;
}

function padronizaRota(text) {
	text = text
		.replace(/<p>((?:R\.?|Rua|Av\.?|Avenida|Trav\.?|Travessa|Al\.?|Alameda|Estr\.?|Estrada)[^\t]*?) (\d+)/gi, '$1\t$2\t\t\t')
		.replace(/<p>/gi, '')
		.replace(/<\/p>/gi, '\n')
		.replace(/casa/gi, '')
		.replace(/<div><br><\/div>/gi, '')
		.replace(/ao fim - lado par/gi, '')
		.replace(/- até/gi, '')
		.replace(/ Nova Forma Eventos/gi, '\t\t\t\tNova Forma Eventos')
		.replace(/(?<!(?:R.|Rua) )dr. levindo Batista de Carvalho/gi, 'R. Dr. Levindo Batista Carvalho')
		.replace(/Avenida Nenê|e Sabino/gi, 'Av. Nenê Sabino')
		.replace(/(?:R(?:\.|ua)? )?Bahia/gi, 'R. Bahia')
    ;
	return text;
}
