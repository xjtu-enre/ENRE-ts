import {writeFile} from 'node:fs/promises';

export default async (lang: string, eTypes: string[], data: Array<Array<Array<string>>>) => {
  const th = eTypes.reduce((p, c) => `${p}<th>${c}</th>`, '');
  let tr = '';
  data.forEach((r, i) => {
    tr += '<tr>' + r.reduce((p, c) => {
      return p + '<td>' + (c.length !== 0 ? c.reduce((ip, ic) => {
        return ip + '<br/>' + ic;
      }) : '') + '</td>';
    }, `<td>${eTypes[i]}</td>`) + '</tr>';
  });

  await writeFile('./FeatureTable.html',
    template.replace('{0}', lang)
      .replace('{1}', th)
      .replace('{2}', tr)
  );
};

const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{0} Feature Table</title>
  <style>
    table {
      border-collapse: collapse;
    }

    table, th, td {
      border: 1px solid;
    }
  </style>
</head>
<body>
<table>
  <tr>
    <th></th>
    {1}
  </tr>
  {2}
</table>
</body>
</html>
`;
