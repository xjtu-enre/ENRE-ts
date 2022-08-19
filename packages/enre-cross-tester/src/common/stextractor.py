import json
import sqlite3
import argparse
import math


def Entity(entityID, entityName, entityType, entityFile = None, startLine = -1, startColumn = -1, endColumn = -1):
    entity = dict()
    entity['id'] = entityID
    entity['name'] = entityName
    entity['type'] = entityType
    entity['belongs_to'] = entityFile
    entity['line'] = startLine
    entity['start_column'] = startColumn
    entity['end_column'] = endColumn
    return entity


def Dependency(dependencyType, dependencySrcID, dependencydestID, startLine = -1, startColumn = -1):
    dependency = dict()
    dependency['type'] = dependencyType
    dependency['from'] = dependencySrcID
    dependency['to'] = dependencydestID
    dependency['line'] = startLine
    dependency['column'] = startColumn
    return dependency


def outputAll(entity_list: list, relation_list:list, json_path: str,  projectname: str):
    file = dict()
    file["script_ver"] = 1.0
    file["entities"] = entity_list
    file["relations"] = relation_list
    file['db_name'] = projectname
    dependency_str = json.dumps(file, indent=4)
    with open(json_path, 'w') as json_file:
        json_file.write(dependency_str)


def output(info_list: list, json_path: str, type:str, projectname: str):
    file = dict()
    file["script_ver"] = 1.0
    file[type] = info_list
    file['db_name'] = projectname
    dependency_str = json.dumps(file, indent=4)
    with open(json_path, 'w') as json_file:
        json_file.write(dependency_str)


def get_all_table_name(cur):
    # 获取表名，保存在tab_name列表
    cur.execute("select name from sqlite_master where type='table'")
    tab_name = cur.fetchall()
    tab_name = [line[0] for line in tab_name]
    # 获取表的列名（字段名），保存在col_names列表,每个表的字段名集为一个元组
    col_names = []
    for line in tab_name:
        cur.execute('pragma table_info({})'.format(line))
        col_name = cur.fetchall()
        col_name = [x[1] for x in col_name]
        col_names.append(col_name)
        col_name = tuple(col_name)
    print(tab_name)
    print(col_names)


def sourcetrail_get_node(cur, field_separator, language):
    # 启用了四个表来完成操作，分别为node, occurrence, file, source_location
    # table information:
    # node: ['id', 'type', 'serialized_name']
    # file: ['id', 'path', 'language', 'modification_time', 'indexed', 'complete', 'line_count']
    # source_location: ['id', 'file_node_id', 'start_line', 'start_column', 'end_line', 'end_column', 'type'],
    # occurrence: ['element_id', 'source_location_id']

    cur.execute("select id,type,serialized_name from node")
    node_infor = cur.fetchall()
    cur.execute("select element_id,source_location_id from occurrence")
    element_to_source = cur.fetchall()
    cur.execute("select id, path from file")
    file_infor = cur.fetchall()
    cur.execute("select id, file_node_id, start_line, start_column, end_line, end_column from source_location")
    node_location_infor = cur.fetchall()

    element_to_source_dict = dict()
    for element in element_to_source:
        element_to_source_dict[element[0]] = element[1]
    file_dict = dict()
    for file in file_infor:
        file_dict[file[0]] = file[1]

    node_location_dict = dict()
    for node in node_location_infor:
        node_location_dict[node[0]] = [node[1], node[2], node[3], node[4], node[5]]

    node_list = list()
    for node in node_infor:
        type = resolve_node_type(node[1])
        name = resolve_node_name(node[2])
        if type == 'FILE':
            name = name.replace(field_separator, "")
        else:
            name = resolve_node_name(node[2])

        if node[0] in element_to_source_dict.keys():
            source_id = element_to_source_dict[node[0]]
            node_location = node_location_dict[source_id]
            node_file_path = file_dict[node_location[0]]
            node_file_path = node_file_path.replace(field_separator, "")
            node_list.append(Entity(node[0], name, type, node_file_path, node_location[1], node_location[2], node_location[4]))
        else:
            node_list.append(Entity(node[0], name, type))
    return node_list


def resolve_node_type(type: int):
    NodeKind = ["UNKNOWN", "TYPE", "BUILTIN_TYPE", "MODULE", "NAMESPACE",
            "PACKAGE", "STRUCT", "CLASS", "INTERFACE", "ANNOTATION",
            "GLOBAL_VARIABLE", "FIELD", "FUNCTION", "METHOD",
            "ENUM", "ENUM_CONSTANT", "TYPEDEF", "TYPE_PARAMETER",
            "FILE", "MACRO", "UNION"]
    return NodeKind[int(math.log(type, 2))]


def sourcetrail_get_edge(cur):
    EdgeKind = ["MEMBER", "TYPE_USAGE", "USAGE", "CALL", "INHERITANCE",
                "OVERRIDE", "TYPE_ARGUMENT", "TEMPLATE_SPECIALIZATION",
                "INCLUDE", "IMPORT", "MACRO_USAGE", "ANNOTATION_USAGE", "UNKNOWN"]
    cur.execute("select id, type, source_node_id, target_node_id from edge")
    edge_infor = cur.fetchall()
    edge_list = list()

    for edge in edge_infor:
        edge_list.append(Dependency(EdgeKind[int(math.log(edge[1], 2))], edge[2], edge[3]))
    return edge_list


def sourcetrail(projectname, language, db_path, root):
    # need: projectname, db_path, field_separator, language, outputFile
    con = sqlite3.connect(db_path)
    cur = con.cursor()

    entityList = sourcetrail_get_node(cur, "", language)
    dependencyList = sourcetrail_get_edge(cur)

    entity_json_path = root + "sourcetrail_" + projectname + "_entity.json"
    dependency_json_path = root + "sourcetrail_" + projectname + "_dependency.json"

    output(entityList, entity_json_path, "entity", projectname)
    output(dependencyList, dependency_json_path, "dependency", projectname)


def resolve_node_name(serializedNameHierarchy: str):
    """
    {
        "name_delimiter": "."
         "name_elements": [
         {
            "prefix": "",
            "name": "",
            "postfix": ""
         },
         ...
         ]
    }
    """
    deserializedName = list()
    name = serializedNameHierarchy.split(META_DELIMITER)
    name_elements = name[1].split(NAME_DELIMITER)
    for element in name_elements:
        name = element.split(PARTS_DELIMITER)[0]
        # other = element.split(PARTS_DELIMITER)[1]
        # prefix = other.split(SIGNATURE_DELIMITER)[0]
        # postfix = other.split(SIGNATURE_DELIMITER)[1]
        deserializedName.append(name)
    if language == 'cpp':
        return "::".join(deserializedName)
    return ".".join(deserializedName)

META_DELIMITER = "\tm"
NAME_DELIMITER = "\tn"
PARTS_DELIMITER = "\ts"
SIGNATURE_DELIMITER = "\tp"

# Usage
parser = argparse.ArgumentParser()
parser.add_argument('lang', help='Sepcify the target language:cpp, java, python, js')
parser.add_argument('project', help='Specify the project name')
parser.add_argument('dbpath', help='Specify the database path')
parser.add_argument('prepath', help='Specify the path your project in')
parser.add_argument('output', help='Specify the output path')
parser.add_argument('-p', help='only save a file containing entities and relations',
    action=argparse.BooleanOptionalAction)
args = parser.parse_args()

print_mode = args.p
language = args.lang
try:
    ['cpp', 'java', 'python', 'js'].index(language)
except:
    raise ValueError(
        f'Invalid lang {language}, only support cpp / java / python')

projectname = args.project
field_separator = args.prepath
db_path = args.dbpath
output_path = args.output
con = sqlite3.connect(db_path)
cur = con.cursor()

entityList = sourcetrail_get_node(cur, field_separator, language)
dependencyList = sourcetrail_get_edge(cur)
if print_mode:
    json_path = output_path + projectname + ".json"
    outputAll(entityList, dependencyList, json_path, projectname)
else:
    entity_json_path = output_path + projectname + "_entity.json"
    dependency_json_path = output_path + projectname + "_dependency.json"
    output(entityList, entity_json_path, "entities", projectname)
    output(dependencyList, dependency_json_path, "relations", projectname)
