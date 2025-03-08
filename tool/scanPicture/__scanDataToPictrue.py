# pip install pillow numpy # 本程序所需插件
import json
from PIL import Image
import numpy as np
import os

# 定义地形类型对应的颜色
TERRAIN_COLORS = {
    0: (0, 0, 255),    # 海洋 - 蓝色
    1: (0, 255, 0),    # 平原 - 绿色
    2: (255, 165, 0),  # 丘陵 - 橙色
    3: (128, 128, 128),# 山地 - 灰色
    4: (255, 255, 255),# 高山 - 白色
    5: (0, 191, 255)   # 湖泊 - 浅蓝色
}

def load_map_data(file_path):
    """加载地图数据"""
    with open(file_path, "r") as f:
        return json.load(f)

def create_map_image(data, hex_width, hex_height):
    """根据地图数据生成图片"""
    # 计算图片的宽度和高度
    max_x = max(d["x"] for d in data)
    max_y = max(d["y"] for d in data)
    width = (max_x + 1) * hex_width
    height = (max_y + 1) * hex_height

    # 创建一个空白图片
    image = Image.new("RGB", (width, height), (255, 255, 255))
    pixels = image.load()

    # 填充每个六边形区域的颜色
    for d in data:
        x = d["x"] * hex_width
        y = d["y"] * hex_height
        terrain_color = TERRAIN_COLORS.get(d["terrain"], (0, 0, 0))  # 默认黑色
        for i in range(x, x + hex_width):
            for j in range(y, y + hex_height):
                if i < width and j < height:
                    pixels[i, j] = terrain_color

    return image

def main():
    # 弹出命令行窗口，提示用户输入文件名
    default_file_name = "map_data.json"
    file_name = input(f"请输入地图数据文件名（默认 {default_file_name}，直接回车使用默认值）：")
    file_name = file_name if file_name else default_file_name

    # 检查文件是否存在
    if not os.path.exists(file_name):
        print(f"文件 {file_name} 不存在！")
        return

    # 加载地图数据
    data = load_map_data(file_name)

    # 提示用户选择六边形网格尺寸
    default_size = "4*4"  # 默认尺寸
    size_input = input(f"请输入六边形网格尺寸（格式：宽度*高度，默认 {default_size}，直接回车使用默认值）：")
    if size_input:
        hex_width, hex_height = map(int, size_input.split("*"))
    else:
        hex_width, hex_height = map(int, default_size.split("*"))

    # 生成地图图片
    image = create_map_image(data, hex_width, hex_height)

    # 保存图片
    output_image_name = "output_map.png"
    image.save(output_image_name)
    print(f"地图图片已保存到 {output_image_name}")

    # 显示图片
    image.show()

    input("已结束，回车可关闭窗口")

if __name__ == "__main__":
    main()