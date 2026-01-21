export function circuit(text) {
	text = padronizaCircuit(text);
	text = corrigirPalavras(text);
	text = padronizaCircuit(text);
	return text;
}

function padronizaCircuit(text) {
	text = text
		.replace(/<p># Address<\/p>\n?<p>Estimated Arrival<\/p>\n?<p>Time<\/p>\n?<p>Actual Arrival Time Notes<\/p>\n?/gi, '')
		.replace(/<p># Address<\/p>\n?<p>Estimated<\/p>\n?<p>Arrival Time<\/p>\n?<p>Actual Arrival<\/p>\n?<p>Time<\/p>\n?<p>Notes<\/p>\n?/gi, '')
		.replace(/<p># Address<\/p>\n?<p>Estimated Arrival<\/p>\n?<p>Time<\/p>\n?<p>Notes<\/p>\n?/gi, '')
		.replace(/<p># Address<\/p>\n?<p>Estimated<\/p>\n?<p>Arrival Time<\/p>\n?<p>Notes<\/p>\n?/gi, '')
		.replace(/(?<=<p>\d+)<\/p>\n<p>(?=Rua|Avenida)/gi, '\t')
		.replace(/<\/p>\n?<p>((?:\d+)? ?min)/gi, '$1')
		.replace(/<\/p>\n?<p>((?:\d+)? ?h ?\d+ ?min)/gi, '$1')
		.replace(/(\d+-)<\/p>\n<p>(\d+)/gi, '$1$2')
		.replace(/(\d+)<\/p>\n<p>(-\d+)/gi, '$1$2')
		.replace(/<p>/gi, '')
		.replace(/<\/p>/gi, '\n')
		.replace(/\# Address Estimated Arrival Time Actual Arrival Time Notes/gi, '')
		.replace(/\n\n/g, '\n')
		.replace(/\n(\d\d:\d\d)/gi, ' $1')
		.replace(/\n([A-Z]+)/gi, ' $1')
		.replace(/\n(\d{1,4}-\d{3})/gi, '$1')
		.replace(/(\d{1,5}-\d{0,2})\n(\d{1,3})/gi, '$1$2')
		.replace(/(\d\d:\d\d)/gi, ' $1 ')
		.replace(/[ ]+/gi, ' ')
		.replace(/(?<=(?:R|Rua|Av\.|Avenida).*?,)\n(\d+)/gi, ' $1')
		.replace(/(\d+) (.*?), (?:número )?(\d+)(?: |, )?((?:ap|apto|apartamento|bl|b|bloco|t|torre|casa|sala) ?(?:\d+)? ?(?:(?:ap|apto|apartamento|bl|b|bloco|t|torre|casa|sala) ?(?:\d+)?)?)? ?,? (.*?), ?(?:Uberaba,)? ?(\d{5}-\d{3}) (\d+:\d+) ?(\d+:\d+)? ?(?:\((?:Adiantado|Atrasado) .*?\))?(.*?)?/gi, '$1\t$2\t$3\t$5\t$6\t$7\t$8\t$4 $9')
		.replace(/\t[ ]+/gi, '\t')
		.replace(/apto\b|apartamento|apt\b|AP\b/gi, 'ap')
		.replace(/bloco|bl\b/gi, 'b')
		.replace(/torre|T\b/gi, 't')
		.replace(/[\t ]*(\d{2}:\d{2})[\t ]*/g, '\t$1\t')
		.replace(/, Uberaba, /gi, '\t')
		.replace(/\tUberaba\t/gi, '\t')
		.replace(/(?<=\d+) (?=Rua|Avenida)/gi, '\t')
		.replace(/(?<=(?:Avenida|Rua)[^,]*, ?\d+), ?/gi, '\t')
		.replace(/(?<=(?:Avenida|Rua)[^,]*), ??/gi, '\t')
		.replace(/(?<=\n\d+) /gi, '\t')
		.replace(/(?<=\n\d+) /gi, '\t')
		.replace(/(?<=\d+:\d+)\t\t ?(?=\d+:\d+)/gi, '\t')
		.replace(/\t?\((?:Adiantado|Atrasado).*?\)/gi, '')
		.replace(/(380\d{0,2}-?)\n(\d|-)/gi, '$1$2')
		.replace(/<div><br><\/div>/gi, '')
		.replace(/(\d+:\d+) +(\w+)/gi, '$1\t$2')
		.replace(/(Morumbi)	 ?Uberaba/gi, '$1')
		.replace(/(\d+\t ?(?:minas gerais|Morumbi))\t ?(\d+:\d+)/gi, '$1\t\t$2')
		.replace(/(\d+\tCondomínio Portal Beija-Flor\t151)\tRua Professor Antônio Simões Borges/gi, '$1')
		.replace(/<span style="white-space:pre">	<\/span>/gi, '\t')
		.replace(/<br>\n?/gi, '')
		.replace(/I I/gi, 'II')
		.replace(/^\n1/gi, '1');
	return text;
}

function corrigirPalavras(texto) {
	const regras = [
		{ correto: 'mecânica', base: 'mecânica' },
		{ correto: 'Uberaba', base: 'Uberaba' },
		{ correto: 'Cartafina', base: 'Cartafina' },
		{ correto: 'rota', base: 'rota' },
		{ correto: 'Costa', base: 'Costa' },
		{ correto: 'min', base: 'min' },
		{ correto: 'Prata', base: 'Prata' },
		{ correto: 'Oliveira', base: 'Oliveira' },
		{ correto: 'Oliveira Prata', base: 'Oliveira Prata' },
		{ correto: 'morador', base: 'morador' },
		{ correto: 'Abadia', base: 'Abadia' },
		{ correto: 'Silva', base: 'Silva' },
		{ correto: 'Adiantado', base: 'Adiantado' },
		{ correto: 'Atrasado', base: 'Atrasado' },
		{ correto: 'Umuarama', base: 'Umuarama' },
		{ correto: 'Palmeiras', base: 'Palmeiras' },
		{ correto: 'tutunas', base: 'tutunas' },
		{ correto: 'Freire', base: 'Freire' },
		{ correto: 'Sol', base: 'Sol' },
		{ correto: 'Canadá', base: 'Canadá' },
		{ correto: 'Residencial', base: 'Residencial' },
		{ correto: 'Alfredo', base: 'Alfredo' },
		{ correto: 'Gerais', base: 'Gerais' },
		{ correto: 'Borges', base: 'Borges' },
		{ correto: 'Beija-Flor', base: 'Beija-Flor' },
		{ correto: 'Conjunto', base: 'Conjunto' },
		{ correto: 'minas', base: 'minas' },
		{ correto: 'Morumbi', base: 'Morumbi' },
		{ correto: 'Professor', base: 'Professor' },
		{ correto: 'Pacaembu', base: 'Pacaembu' },
		{ correto: 'bloco', base: 'boco' },
		{ correto: 'ramid', base: 'ramid' },
		{ correto: 'Mauad', base: 'Mauad' },
		{ correto: 'espanha', base: 'espanha' },
		{ correto: 'Derenusson', base: 'Derenusson' },
		{ correto: 'na', base: 'na' },
		{ correto: 'da', base: 'da' },
		{ correto: 'du', base: 'du' },
		{ correto: 'de', base: 'de' },
		{ correto: 'Morada', base: 'Morada' },
		{ correto: 'deixar', base: 'deixar' },
		{ correto: 'Beatriz', base: 'Beatriz' },
		{ correto: 'Address', base: 'Address' },
		{ correto: 'Estimated ', base: 'Estimated' },
		{ correto: 'Arrival', base: 'Arrival' },
		{ correto: 'Estimated Arrival', base: 'EstimatedArrival' },
		{ correto: 'Time', base: 'Time' },
		{ correto: 'Actual', base: 'Actual' },
		{ correto: 'Notes', base: 'Notes' },
		{ correto: 'Avenida', base: 'Avenida' },
		{ correto: 'Doutor', base: 'Doutor' },
		{ correto: 'José', base: 'José' },
		{ correto: 'Ferreira', base: 'Ferreira' },
		{ correto: 'Jockey', base: 'Jockey' },
		{ correto: 'Park', base: 'Park' },
		{ correto: 'buraco', base: 'buraco' },
		{ correto: 'energia', base: 'energia' },
		{ correto: 'cima', base: 'cima' },
		{ correto: 'Antônio', base: 'Antônio' },
		{ correto: 'Fatureto', base: 'Fatureto' },
		{ correto: 'Grande', base: 'Grande' },
		{ correto: 'Horizonte', base: 'Horizonte' },
		{ correto: 'Azevedo', base: 'Azevedo' },
		{ correto: 'destino', base: 'destino' },
		{ correto: 'Industrial', base: 'Industrial' },
		{ correto: 'Jardim', base: 'Jardim' },
		{ correto: 'Fiori', base: 'Fiori' },
		{ correto: 'número', base: 'número' },
		{ correto: 'lemes', base: 'lemes' },
		{ correto: 'apartamento', base: 'apartamento' },
		{ correto: 'Fontes', base: 'Fontes' },
		{ correto: 'Afrânio', base: 'Afrânio' },
		{ correto: 'Universitário', base: 'Universitário' },
		{ correto: 'Olinda', base: 'Olinda' },
		{ correto: 'Leblon', base: 'Leblon' },
		{ correto: 'Retiro', base: 'Retiro' },
		{ correto: 'São', base: 'São' },
		{ correto: 'vizinho', base: 'vizinho' },
		{ correto: 'Geraldo', base: 'Geraldo' },
		{ correto: 'Santa', base: 'Santa' },
		{ correto: 'Maria', base: 'Maria' },
		{ correto: 'dumont', base: 'dumont' },
		{ correto: 'Alameda', base: 'Alameda' },
		{ correto: 'Lilás', base: 'Lilás' },
	];

	for (const { correto, base } of regras) {
		// Monta regex tipo m\s*e\s*c\s*â\s*n\s*i\s*c\s*a
		const regex = new RegExp(base.split('').join('\\s*'), 'gi');
		texto = texto.replace(regex, correto);
	}

	return texto;
}
