import numpy as np
from PIL import Image
import json
import os

# 定义地形类型
TERRAIN_TYPES = {
    "OCEAN": 0,
    "PLAIN": 1,
    "HILL": 2,
    "MOUNTAIN": 3,
    "HIGH_MOUNTAIN": 4,
    "LAKE": 5
}

def get_terrain_type(color):
    """根据颜色判断地形类型"""
    r, g, b = color
    if b > 200 and r < 100 and g < 100:  # 海洋
        return TERRAIN_TYPES["OCEAN"]
    elif g > 200 and r < 100 and b < 100:  # 平原
        return TERRAIN_TYPES["PLAIN"]
    elif r > 200 and g > 100 and b < 100:  # 丘陵
        return TERRAIN_TYPES["HILL"]
    elif r > 200 and g < 100 and b < 100:  # 山地
        return TERRAIN_TYPES["MOUNTAIN"]
    elif r > 200 and g > 200 and b > 200:  # 高山
        return TERRAIN_TYPES["HIGH_MOUNTAIN"]
    elif b > 100 and g > 100 and r < 100:  # 湖泊
        return TERRAIN_TYPES["LAKE"]
    else:
        return TERRAIN_TYPES["PLAIN"]  # 默认平原

def get_humidity_level(color):
    """根据颜色判断湿度等级，取值范围 0~10"""
    r, g, b = color
    return int((g / 255) * 10)  # 湿度范围为 0~10

def get_height_level(color):
    """根据颜色判断高度等级，取值范围 0~255"""
    r, g, b = color
    return int(r)  # 高度范围为 0~255

def get_latitude_level(y, height):
    """根据Y坐标判断纬度等级，取值范围 0~5"""
    return int((y / height) * 5)  # 纬度范围为 0~5

def normalize_heights(data):
    """将高度值映射到 0~255 的范围内"""
    heights = [d["height"] for d in data]
    min_height = min(heights)
    max_height = max(heights)

    if min_height == max_height:
        # 如果所有高度值相同，直接设置为 128
        for d in data:
            d["height"] = 128
    else:
        # 线性映射到 0~255
        for d in data:
            d["height"] = int(((d["height"] - min_height) / (max_height - min_height)) * 255)

    return data

def sample_image(image, hex_width, hex_height, sampling_method):
    """对图片进行六边形网格取样"""
    width, height = image.size
    data = []
    index_x = 0
    index_y = 0

    for y in range(0, height, hex_height):
        for x in range(0, width, hex_width):
            if sampling_method == 1:
                # 取样方式1：网格内所有像素平均
                pixels = []
                for i in range(x, x + hex_width):
                    for j in range(y, y + hex_height):
                        if i < width and j < height:
                            pixels.append(image.getpixel((i, j)))
                if pixels:
                    avg_color = np.mean(pixels, axis=0)
            else:
                # 取样方式2：网格中心点的一定范围的所有像素平均
                center_x = x + hex_width // 2
                center_y = y + hex_height // 2
                pixels = []
                for i in range(center_x - 5, center_x + 5):
                    for j in range(center_y - 5, center_y + 5):
                        if i < width and j < height:
                            pixels.append(image.getpixel((i, j)))
                if pixels:
                    avg_color = np.mean(pixels, axis=0)

            if pixels:
                terrain_type = get_terrain_type(avg_color)
                humidity_level = get_humidity_level(avg_color)
                height_level = get_height_level(avg_color)
                latitude_level = get_latitude_level(y, height)
                data.append({
                    "x": index_x,  # 使用索引值
                    "y": index_y,  # 使用索引值
                    "terrain": terrain_type,
                    "humidity": humidity_level,
                    "height": height_level,
                    "latitude": latitude_level
                })
            index_x += 1
        index_x = 0
        index_y += 1

    return data

def main():
    # 弹出命令行窗口，提示用户输入文件名
    default_image_name = "temp_map.png"
    image_name = input(f"请输入地图图片文件名（默认 {default_image_name}，直接回车使用默认值）：")
    image_name = image_name if image_name else default_image_name

    # 检查文件是否存在
    if not os.path.exists(image_name):
        print(f"图片文件 {image_name} 不存在！")
        return

    # 读取地图图片
    image = Image.open(image_name).convert("RGB")

    # 提示用户选择尺寸
    default_size = "30*20"  # 默认尺寸
    size_input = input(f"请输入六边形网格尺寸（格式：宽度*高度，默认 {default_size}，直接回车使用默认值）：")
    if size_input:
        hex_width, hex_height = map(int, size_input.split("*"))
    else:
        hex_width, hex_height = map(int, default_size.split("*"))

    # 提示用户选择取样方式
    sampling_method = input("请输入取样方式（1: 网格内所有像素平均, 2: 网格中心点范围平均, 默认1）：")
    sampling_method = int(sampling_method) if sampling_method else 1

    # 取样
    data = sample_image(image, hex_width, hex_height, sampling_method)

    # 提示用户是否填满高度
    fill_height = input("是否填满高度（y/n，默认 n）：")
    if fill_height.lower() == 'y':
        data = normalize_heights(data)

    # 保存为JSON文件
    output_path = "map_data.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=4)

    print(f"取样完成，结果已保存到 {output_path}")

if __name__ == "__main__":
    main()