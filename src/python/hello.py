import site
from graphbrain import *
from graphbrain.notebook import *
from graphbrain.parsers import *

hg = hgraph('example.db')

parser = create_parser(lang='en')
text = "Mary is playing a very old violin."

parses = parser.parse(text)
for parse in parses['parses']:
    edge = parse['main_edge']
    print(edge)
    hg.add(edge)

