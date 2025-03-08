import json
import os

def compress_json(input_file, compress_format=True, compress_fields=True):
    # 读取原始JSON文件
    with open(input_file, 'r') as f:
        data = json.load(f)

    # 显示原始文件大小
    original_size = os.path.getsize(input_file)
    print(f"原始文件大小: {original_size} 字节")

    # 压缩字段名
    if compress_fields:
        field_mapping = {}
        for key in data[0].keys():
            short_key = key[0]  # 取首字母
            # 处理冲突
            while short_key in field_mapping.values():
                short_key = key[:len(short_key) + 1]
            field_mapping[key] = short_key

        # 显示字段名压缩映射
        print("\n字段名压缩映射:")
        for original, compressed in field_mapping.items():
            print(f"{original} => {compressed}")

        # 应用字段名压缩
        compressed_data = []
        for item in data:
            compressed_item = {field_mapping[k]: v for k, v in item.items()}
            compressed_data.append(compressed_item)
    else:
        compressed_data = data

    # 压缩格式（去除换行符和空格）
    if compress_format:
        compressed_json = json.dumps(compressed_data, separators=(',', ':'))
    else:
        compressed_json = json.dumps(compressed_data, indent=4)

    # 生成新文件名
    base_name, ext = os.path.splitext(input_file)
    output_file = f"{base_name}_compressed{ext}"

    # 保存压缩后的JSON文件
    with open(output_file, 'w') as f:
        f.write(compressed_json)

    # 显示压缩后的文件大小
    compressed_size = os.path.getsize(output_file)
    print(f"\n压缩后文件大小: {compressed_size} 字节")

    # 计算压缩率
    compression_ratio = (original_size - compressed_size) / original_size * 100
    print(f"压缩率: {compression_ratio:.2f}%")

    print(f"\n压缩后的文件已保存为: {output_file}")

def main():
    # 提示用户输入文件名
    input_file = input("请输入要压缩的JSON文件名（默认 map_data.json，直接回车使用默认值）：")
    if not input_file:
        input_file = "map_data.json"

    # 检查文件是否存在
    if not os.path.exists(input_file):
        print(f"文件 {input_file} 不存在！")
        return

    # 提示用户是否压缩格式
    compress_format = input("是否压缩格式（去除换行符、空格等）(y/n，默认 y): ")
    if compress_format.lower() != 'n':
        compress_format = True
    else:
        compress_format = False

    # 提示用户是否压缩字段名
    compress_fields = input("是否压缩字段名 (y/n，默认 y): ")
    if compress_fields.lower() != 'n':
        compress_fields = True
    else:
        compress_fields = False

    # 执行压缩
    compress_json(input_file, compress_format, compress_fields)

    input("\n已结束，回车可关闭窗口")

if __name__ == "__main__":
    main()