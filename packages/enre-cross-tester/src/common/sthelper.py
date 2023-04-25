import time
# pyuserinput depends on pywin32==301
from pymouse import PyMouse
from pykeyboard import PyKeyboard
import pyperclip
import csv
import os
import argparse

m = PyMouse()
k = PyKeyboard()

def create_st_project(projectname,projectlocation,language,FileDirectory):
    time.sleep(3)  # 等待3秒，点开sourcetrail界面
    m.click(24, 34)  # 点击project
    time.sleep(0.5)  # 等待0.5秒让机器反应
    m.click(95, 60)  # 点击new project
    time.sleep(1)  # 等待1秒让机器反应进入第2个界面

    m.click(996, 314)  # 点击并输入projectname
    k.type_string(projectname)
    k.tap_key(k.enter_key)
    time.sleep(0.5)  # 等待0.5秒让机器反应
    m.click(1012, 345)  # 点击并输入projectlocation
    k.type_string(projectlocation)
    k.tap_key(k.enter_key)
    m.click(1202, 796)  # 点击add source group
    time.sleep(1)  # 等待1秒让机器反应进入第个3界面
    k.tap_key(k.enter_key)  # Create the non-existed directory

    if language=='cpp':
        m.click(752, 347)  # 点击C++
        time.sleep(0.5)  # 等待0.5秒让机器反应
        m.click(881, 539)  # 点击C++ Empty Source Group
        time.sleep(1)  # 等待1秒让机器反应进入第个3界面
    elif language=='java':
        m.click(758, 425)  # 点击Java
        time.sleep(0.5)  # 等待0.5秒让机器反应
        m.click(1065, 379)  # 点击Java Empty Source Group
        time.sleep(1)  # 等待1秒让机器反应进入第个3界面
    elif language=='python':
        m.click(747, 464)  # 点击Python
        time.sleep(0.5)  # 等待0.5秒让机器反应
        m.click(900, 416)  # 点击Empty Python Source Group
        time.sleep(1)  # 等待1秒让机器反应进入第个3界面
    m.click(1176, 763)  # 点击next
    time.sleep(1)  # 等待1秒让机器反应进入第个4界面

    if language=='cpp':
        m.click(1344, 701)
    elif language == 'java':
        m.click(1344, 562)  # 点击edit小图标
    elif language == 'python':
        m.click(946, 381)   # Python executable path
        # Do not use this, this is too slow and will cause problems
        # k.type_string('C:\\Users\\ThisRabbit\\AppData\\Local\\Programs\\Python\\Python38\\')
        pyperclip.copy('C:\\Users\\ThisRabbit\\AppData\\Local\\Programs\\Python\\Python38\\')
        k.press_keys([k.control_key, 'v'])
        time.sleep(3)   # Wait for path checking (will change coordinates of latter components)
        m.click(1344, 560)
    time.sleep(1)  # 等待1秒让机器反应进入第个5界面

    m.click(770, 350)  # 点击File & Directories to Index进入第六个界面
    k.type_string(FileDirectory)
    k.tap_key(k.enter_key)
    time.sleep(0.5)  # 等待0.5秒让机器反应
    m.click(1175, 764)  # 点击save回到第五个界面
    time.sleep(1)  # 等待1秒让机器反应
    m.click(1344, 796)  # 点击create创建项目
    time.sleep(5)  # 等待10秒让机器反应
    m.click(842, 635)  # 点击cancel取消分析
    return


# Usage
parser = argparse.ArgumentParser()
parser.add_argument('lang', help='Specify the target language: cpp, java, python')
parser.add_argument('g', help='Group name')
parser.add_argument('c', help='Case name')
args = parser.parse_args()


try:
    os.remove(f'{os.getcwd()}/tests/sourcetrail/{args.g}/{args.c}/{args.c}.srctrlbm')
    os.remove(f'{os.getcwd()}/tests/sourcetrail/{args.g}/{args.c}/{args.c}.srctrldb')
    os.remove(f'{os.getcwd()}/tests/sourcetrail/{args.g}/{args.c}/{args.c}.srctrlprj')
    print(f'Removed old files for project {args.g}/{args.c}')
except:
    pass

create_st_project(args.c, f'{os.getcwd()}/tests/sourcetrail/{args.g}/{args.c}', args.lang, f'{os.getcwd()}/tests/cases/_{args.g}/_{args.c}')
print(f'Created {args.lang} project {args.g}/{args.c}')
