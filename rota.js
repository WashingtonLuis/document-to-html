export function rota(text) {
	text = padronizaRota(text);
	text = removeQuebras(text);
	return text;
}

function padronizaRota(text) {
	text = text
		.replace(/- de \d+\/\d+ ao fim/gi, '')
		.replace(/- de \d+ ao fim -/gi, '')
		.replace(/<p>((?:R\.?|Rua|Av\.?|Avenida|Trav\.?|Travessa|Al\.?|Alameda|Estr\.?|Estrada)[^\t]*?)[ ,]*(\d+)/gi, '$1, $2\t\t\t\t\t')
		.replace(/<p>/gi, '')
		.replace(/\n?<br>/gi, '')
		.replace(/<\/p>/gi, '\n')
		.replace(/\n?(?:Ofertas|Alertas|Chot|Conta|Rokas|Cosa|casa|Rotas|Chat)/gi, '')
		.replace(/<div><br><\/div>/gi, '')
		.replace(/ao fim - lado par/gi, '')
		.replace(/- até/gi, '')
		.replace(/ Nova Forma Eventos/gi, '\t\t\t\tNova Forma Eventos')
		.replace(/(?<!(?:R.|Rua) )dr. levindo Batista de Carvalho/gi, 'R. Dr. Levindo Batista Carvalho')
		.replace(/Avenida Nenê|e Sabino/gi, 'Av. Nenê Sabino')
		.replace(/(?:R(?:\.|ua)? )?Bahia/gi, 'R. Bahia')
		.replace(/APRO/gi, 'Ap')
		.replace(/ s\/n/gi, '')
		.replace(/Avenida Santos Dumont Clínica de olhos/gi, 'Clínica de olhos')
		.replace(/Rua Abrão Elias Achcar/gi, 'Rua João Marcos Rocha')
		.replace(/Rua C\b/gi, 'Rua Cleonaldo Barbosa da Silva,')
		.replace(/Rua A\b/gi, 'Rua Sessenta e oito,')
		.replace(/rua sal peracio/gi, 'R. Saul Perácio')
		.replace(/(Alameda Oitis,? \d+) ?/gi, '$1\t')
		.replace(/Rua Ana Maria Abocater Gomes de Paula/gi, 'R. Ana Maria Aboucater de Paula')
		.replace(/\. antiga D\b/gi, '')
		.replace(/Galpão/gi, '\tGalpão')
		.replace(/(\d+),(\d+)/gi, '$1\t$2')
		.replace(/Aguardando carregamento/gi, '')
		.replace(/Número /gi, ' ')
		.replace(/<span style="white-space:pre">	<\/span>/gi, '\t')
		.replace(/((?=Rua|R\.|Avenida|Av\.|Alameda|Al.)\b[^\d]* \d+) (?!\n)/gi, '$1\t')
		.replace(/((?=Rua|R\.|Avenida|Av\.|Alameda|Al.)\b[^\d,]*) ?(\d+)/gi, '$1, $2')
		.replace(/ ,/gi, ',')
		.replace(/,(\d)/gi, ', $1')
		.replace(/proximo ao campo do estrela da vitória/gi, '')
		.replace(/ cinza de esquina/gi, '\tcinza de esquina')
		.replace(/<div><\/div>/gi, '');
	return text;
}

function removeQuebras(text) {
	const output = text.replace(/\n{2,}/gi, '\n');
	return output === text ? output : removeQuebras(output);
}
