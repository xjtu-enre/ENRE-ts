import cli from './cli-temp';
import generator from './generator';

cli.action(generator);
cli.parse(process.argv);
