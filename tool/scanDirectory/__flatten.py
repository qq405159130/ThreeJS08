import os
import shutil
import tkinter as tk
from tkinter import messagebox

# 定义常量
IGNORE_EXPORT_MARKER = "//#ignore_export"  # 忽略文件的标识符


def is_fully_commented(file_path):
    # 根据文件扩展名确定注释符号
    ext = os.path.splitext(file_path)[1]
    if ext in ('.ts', '.tsx', '.js'):
        single_line_comment = '//'
        multi_line_comment_start = '/*'
        multi_line_comment_end = '*/'
    elif ext == '.css':
        single_line_comment = None
        multi_line_comment_start = '/*'
        multi_line_comment_end = '*/'
    elif ext == '.html':
        single_line_comment = None
        multi_line_comment_start = '<!--'
        multi_line_comment_end = '-->'
    else:
        return False  # 不支持的文件类型，默认不跳过

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 检查每一行是否被注释
    in_multi_line_comment = False
    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:  # 空行跳过
            continue

        if in_multi_line_comment:
            if multi_line_comment_end in stripped_line:
                in_multi_line_comment = False
            continue
        elif single_line_comment and stripped_line.startswith(single_line_comment):
            continue
        elif stripped_line.startswith(multi_line_comment_start):
            if multi_line_comment_end not in stripped_line:
                in_multi_line_comment = True
            continue
        else:
            return False  # 发现未注释的行

    return True  # 所有行都被注释

def flatten_and_save_structure(root_folder, src_relative, dest_relative, structure_relative, merge_files=False):
    # 构建完整路径
    src_folder = os.path.join(root_folder, src_relative)
    dest_folder = os.path.join(root_folder, dest_relative)
    structure_file = os.path.join(root_folder, structure_relative)

    # 删除目标文件夹（如果存在）
    if os.path.exists(dest_folder):
        shutil.rmtree(dest_folder)

    # 创建目标文件夹
    os.makedirs(dest_folder)

    # 打开文件以保存目录结构
    with open(structure_file, 'w', encoding='utf-8') as f:
        # 递归遍历目录并生成树形结构
        def write_tree(directory, prefix=""):
            # 获取目录下的所有文件和文件夹
            entries = os.listdir(directory)
            entries.sort()  # 按名称排序
            for i, entry in enumerate(entries):
                full_path = os.path.join(directory, entry)
                is_last = (i == len(entries) - 1)  # 是否是最后一个条目

                # 写入当前条目
                f.write(f"{prefix}{'└── ' if is_last else '├── '}{entry}\n")

                # 如果是文件夹，递归处理
                if os.path.isdir(full_path):
                    write_tree(full_path, prefix + ("    " if is_last else "│   "))

        # 写入树形结构
        f.write(f"{src_folder}\n")  # 使用完整路径
        write_tree(src_folder)

    # 统计信息
    file_count = 0
    total_lines = 0

    # 如果需要合并文件内容
    if merge_files:
        all_code_file = os.path.join(dest_folder, "__src_allCode.txt")
        with open(all_code_file, 'w', encoding='utf-8') as all_code:
            # 遍历 src 文件夹
            for root, dirs, files in os.walk(src_folder):
                for file in files:
                    if file.endswith(('.ts', '.tsx', '.css', '.html', '.js')):
                        file_path = os.path.join(root, file)
                        # 先检查文件第一行是否包含忽略标识
                        with open(file_path, 'r', encoding='utf-8') as src_file:
                            first_line = src_file.readline()
                            if first_line.strip() == IGNORE_EXPORT_MARKER:
                                print(f"文件 {file} 包含 {IGNORE_EXPORT_MARKER}，跳过处理。")
                                continue
                        # 再检查文件是否全部被注释
                        if is_fully_commented(file_path):
                            print(f"文件 {file} 被完全注释，跳过处理。")
                            continue
                        # 写入文件名作为分隔符
                        all_code.write(f"\n\n// === File: {file} ===\n\n")
                        # 写入文件内容
                        with open(file_path, 'r', encoding='utf-8') as src_file:
                            content = src_file.read()
                            all_code.write(content)
                            # 统计行数
                            lines = content.splitlines()
                            total_lines += len(lines)
                            file_count += 1

    # 复制文件到目标文件夹
    for root, dirs, files in os.walk(src_folder):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.css', '.html', '.js')):
                src_file_path = os.path.join(root, file)
                # 先检查文件第一行是否包含忽略标识
                with open(src_file_path, 'r', encoding='utf-8') as src_file:
                    first_line = src_file.readline()
                    if first_line.strip() == IGNORE_EXPORT_MARKER:
                        print(f"文件 {file} 包含 {IGNORE_EXPORT_MARKER}，跳过处理。")
                        continue
                # 再检查文件是否全部被注释
                if is_fully_commented(src_file_path):
                    print(f"文件 {file} 被完全注释，跳过处理。")
                    continue
                dest_file_path = os.path.join(dest_folder, file)
                # 直接覆盖文件
                shutil.copy2(src_file_path, dest_file_path)
                # 统计行数
                with open(src_file_path, 'r', encoding='utf-8') as src_file:
                    lines = src_file.readlines()
                    total_lines += len(lines)
                    file_count += 1

    print(f"所有文件已复制到: {dest_folder}")
    print(f"目录结构已保存到: {structure_file}")
    if merge_files:
        print(f"所有文件内容已合并到: {os.path.join(dest_folder, '__src_allCode.txt')}")

    # 返回统计信息
    return file_count, total_lines

def merge_game_files(root_folder, game_relative, dest_relative):
    # 构建完整路径
    game_folder = os.path.join(root_folder, game_relative)
    dest_folder = os.path.join(root_folder, dest_relative)
    merged_file = os.path.join(dest_folder, "__threejs_env.txt")

    # 确保目标文件夹存在
    if not os.path.exists(dest_folder):
        os.makedirs(dest_folder)

    # 需要合并的文件列表
    files_to_merge = ["index.html", "package.json", "tsconfig.json", "vite.config.ts"]

    file_line_counts = {}

    with open(merged_file, 'w', encoding='utf-8') as merged:
        for file_name in files_to_merge:
            file_path = os.path.join(game_folder, file_name)
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                merged.write(f"\n\n// === File: {file_name} ===\n\n")
                with open(file_path, 'r', encoding='utf-8') as src_file:
                    content = src_file.read()
                    merged.write(content)
                    # 统计行数
                    lines = content.splitlines()
                    file_line_counts[file_name] = len(lines)
            else:
                print(f"文件 {file_name} 为空或不存在，跳过合并。")

    print(f"特定文件已合并到: {merged_file}")

    # 返回统计信息
    return file_line_counts

def save_public_structure(root_folder, public_relative, structure_relative):
    # 构建完整路径
    public_folder = os.path.join(root_folder, public_relative)
    structure_file = os.path.join(root_folder, structure_relative)

    # 打开文件以保存目录结构
    with open(structure_file, 'w', encoding='utf-8') as f:
        # 递归遍历目录并生成树形结构
        def write_tree(directory, prefix=""):
            # 获取目录下的所有文件和文件夹
            entries = os.listdir(directory)
            entries.sort()  # 按名称排序
            for i, entry in enumerate(entries):
                full_path = os.path.join(directory, entry)
                is_last = (i == len(entries) - 1)  # 是否是最后一个条目

                # 写入当前条目
                f.write(f"{prefix}{'└── ' if is_last else '├── '}{entry}\n")

                # 如果是文件夹，递归处理
                if os.path.isdir(full_path):
                    write_tree(full_path, prefix + ("    " if is_last else "│   "))

        # 写入树形结构
        f.write(f"{public_folder}\n")  # 使用完整路径
        write_tree(public_folder)

    # 统计信息
    total_files = 0
    total_size = 0
    file_type_stats = {}

    for root, dirs, files in os.walk(public_folder):
        for file in files:
            file_path = os.path.join(root, file)
            file_size = os.path.getsize(file_path)
            total_files += 1
            total_size += file_size
            ext = os.path.splitext(file)[1].lower()
            if ext in file_type_stats:
                file_type_stats[ext]['count'] += 1
                file_type_stats[ext]['size'] += file_size
            else:
                file_type_stats[ext] = {'count': 1, 'size': file_size}

    print(f"public目录结构已保存到: {structure_file}")

    # 返回统计信息
    return total_files, total_size, file_type_stats

def show_options():
    # 创建Tkinter根窗口
    root = tk.Tk()
    root.withdraw()  # 隐藏主窗口

    # 显示功能说明和选项
    print("本脚本的子功能如下：\n"
          "① 复制game/src目录的文件结构；（所有文件，并生成 __src_directory.txt 文件）\n"
          "② 扁平化复制game/src目录的文件；（只考虑.ts、.tsx、.css、.html、.js文件，其他略过，并生成 __flattened 文件夹）\n"
          "③ 合并复制game/src目录的文件；（只考虑.ts、.tsx、.css、.html、.js文件，其他略过，并生成 __src_allCode.txt 文件）\n"
          "④ 合并复制game目录下这几个文件为__threejs_env: index.html, package.json, tsconfig.json, vite.config.ts；（注意要做文件判空）\n"
          "⑤ 复制game/public目录的文件结构，放置在 __public_directory.txt 里 \n"
          "\n\n"
          "现在，你可以输入这些选项来执行特定子功能的组合\n"
          "1. 默认功能：所有子功能\n"
          "2. 选项1：① + ④ + ⑤ + ② \n"
          "3. 选项2：① + ④ + ⑤ + ③ \n")

    # 获取用户输入
    user_input = input("请输入选项：(默认空白), 1, 2: ").strip()

    # 设置根文件夹为当前脚本所在目录
    root_folder = os.path.dirname(os.path.abspath(__file__)) #取__file__所在目录作为根目录
    # root_folder = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) #取__file__所在目录的父目录的父目录作为根目录

    # 设置相对路径
    src_relative = "game/src"  # src 文件夹相对于根文件夹的路径
    dest_relative = "__flattened"  # 目标文件夹相对于根文件夹的路径
    structure_relative = "__flattened/__src_directory.txt"  # 目录结构文件相对于根文件夹的路径
    game_relative = "game"  # game 文件夹相对于根文件夹的路径
    public_relative = "game/public"  # public 文件夹相对于根文件夹的路径
    public_structure_relative = "__flattened/__public_directory.txt"  # public目录结构文件相对于根文件夹的路径

    # 根据用户输入执行相应功能
    if user_input == "":
        # 默认功能：合并文件
        file_count, total_lines = flatten_and_save_structure(root_folder, src_relative, dest_relative, structure_relative, merge_files=True)
        file_line_counts = merge_game_files(root_folder, game_relative, dest_relative)
        total_files, total_size, file_type_stats = save_public_structure(root_folder, public_relative, public_structure_relative)
    elif user_input == "1":
        # 选项1：不合并文件
        file_count, total_lines = flatten_and_save_structure(root_folder, src_relative, dest_relative, structure_relative, merge_files=False)
        file_line_counts = merge_game_files(root_folder, game_relative, dest_relative)
        total_files, total_size, file_type_stats = save_public_structure(root_folder, public_relative, public_structure_relative)
    elif user_input == "2":
        # 选项2：仅输出目录结构和合并后的代码
        # 删除目标文件夹（如果存在）
        if os.path.exists(dest_relative):
            shutil.rmtree(dest_relative)
        # 创建目标文件夹
        os.makedirs(dest_relative)
        # 仅生成目录结构和合并文件
        with open(structure_relative, 'w', encoding='utf-8') as f:
            def write_tree(directory, prefix=""):
                entries = os.listdir(directory)
                entries.sort()
                for i, entry in enumerate(entries):
                    full_path = os.path.join(directory, entry)
                    is_last = (i == len(entries) - 1)
                    f.write(f"{prefix}{'└── ' if is_last else '├── '}{entry}\n")
                    if os.path.isdir(full_path):
                        write_tree(full_path, prefix + ("    " if is_last else "│   "))

            f.write(f"{src_relative}\n")
            write_tree(src_relative)

        all_code_file = os.path.join(dest_relative, "__src_allCode.txt")
        file_count = 0  # 初始化文件数量
        total_lines = 0  # 初始化总代码行数
        with open(all_code_file, 'w', encoding='utf-8') as all_code:
            for root, dirs, files in os.walk(src_relative):
                for file in files:
                    if file.endswith(('.ts', '.tsx', '.css', '.html', '.js')):
                        file_path = os.path.join(root, file)
                        # 先检查文件第一行是否包含忽略标识
                        with open(file_path, 'r', encoding='utf-8') as src_file:
                            first_line = src_file.readline()
                            if first_line.strip() == IGNORE_EXPORT_MARKER:
                                print(f"文件 {file} 包含 {IGNORE_EXPORT_MARKER}，跳过处理。")
                                continue
                        # 再检查文件是否全部被注释
                        if is_fully_commented(file_path):
                            print(f"文件 {file} 被完全注释，跳过处理。")
                            continue
                        # 写入文件名作为分隔符
                        all_code.write(f"\n\n// === File: {file} ===\n\n")
                        # 写入文件内容
                        with open(file_path, 'r', encoding='utf-8') as src_file:
                            content = src_file.read()
                            all_code.write(content)
                            # 统计行数
                            lines = content.splitlines()
                            total_lines += len(lines)
                            file_count += 1

        file_line_counts = merge_game_files(root_folder, game_relative, dest_relative)
        total_files, total_size, file_type_stats = save_public_structure(root_folder, public_relative, public_structure_relative)

        print(f"目录结构已保存到: {structure_relative}")
        print(f"所有文件内容已合并到: {all_code_file}")
    else:
        print("无效的选项，程序退出。")
        return

    # 输出统计信息
    print("\n=== 统计信息 ===")
    print(f"功能①②③：")
    print(f"  文件数量: {file_count}")
    print(f"  总代码行数: {total_lines}")
    print(f"  平均代码行数: {total_lines / file_count if file_count > 0 else 0}")

    print(f"\n功能④：")
    for file_name, line_count in file_line_counts.items():
        print(f"  {file_name}: {line_count} 行")

    print(f"\n功能⑤：")
    print(f"  总文件数量: {total_files}")
    print(f"  总空间大小: {total_size} 字节")
    for ext, stats in file_type_stats.items():
        print(f"  {ext} 文件: {stats['count']} 个, {stats['size']} 字节, 占比 {stats['size'] / total_size * 100:.2f}%")

    # 提示用户按回车结束
    input("\n已结束，回车可结束。")

if __name__ == "__main__":
    show_options()