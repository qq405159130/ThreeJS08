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

# 定义湿度等级
HUMIDITY_LEVELS = {
    "LOW": 0,
    "MEDIUM": 1,
    "HIGH": 2
}

# 定义高度等级
HEIGHT_LEVELS = {
    "LOW": 0,
    "MEDIUM": 1,
    "HIGH": 2
}

# 定义纬度等级
LATITUDE_LEVELS = {
    "LOW": 0,
    "MEDIUM": 1,
    "HIGH": 2
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
    """根据颜色判断湿度等级"""
    r, g, b = color
    if g > 200:  # 高湿度
        return HUMIDITY_LEVELS["HIGH"]
    elif g > 100:  # 中湿度
        return HUMIDITY_LEVELS["MEDIUM"]
    else:  # 低湿度
        return HUMIDITY_LEVELS["LOW"]

def get_height_level(color):
    """根据颜色判断高度等级"""
    r, g, b = color
    if r > 200:  # 高海拔
        return HEIGHT_LEVELS["HIGH"]
    elif r > 100:  # 中海拔
        return HEIGHT_LEVELS["MEDIUM"]
    else:  # 低海拔
        return HEIGHT_LEVELS["LOW"]

def get_latitude_level(y, height):
    """根据Y坐标判断纬度等级"""
    if y < height / 3:  # 低纬度
        return LATITUDE_LEVELS["LOW"]
    elif y < 2 * height / 3:  # 中纬度
        return LATITUDE_LEVELS["MEDIUM"]
    else:  # 高纬度
        return LATITUDE_LEVELS["HIGH"]

def sample_image(image, hex_size, sampling_method):
    """对图片进行六边形网格取样"""
    width, height = image.size
    hex_width = hex_size * 2
    hex_height = int(hex_size * np.sqrt(3))
    data = []

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
                center_x = x + hex_size
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
                    "x": x,
                    "y": y,
                    "terrain": terrain_type,
                    "humidity": humidity_level,
                    "height": height_level,
                    "latitude": latitude_level
                })

    return data

def main():
    try:
        # 弹出命令行窗口，提示用户选择取样方式
        print("本程序功能：读取地球地图图片，按照六边形网格取样，输出地形、湿度、高度、纬度信息。")
        sampling_method = input("请输入取样方式（1: 网格内所有像素平均, 2: 网格中心点范围平均, 默认1）：")
        sampling_method = int(sampling_method) if sampling_method else 1

        # 读取地图图片
        image_path = "earth_map.png"  # 替换为你的地图图片路径
        if not os.path.exists(image_path):
            print(f"图片文件 {image_path} 不存在！")
            return

        image = Image.open(image_path).convert("RGB")
        hex_size = 20  # 六边形网格大小

        # 取样
        data = sample_image(image, hex_size, sampling_method)

        # 保存为JSON文件
        output_path = "map_data.json"
        with open(output_path, "w") as f:
            json.dump(data, f, indent=4)

        print(f"取样完成，结果已保存到 {output_path}")
    except Exception as e:
        print(f"程序运行出错: {e}")
        input("按回车键退出...")  # 等待用户按下回车键

if __name__ == "__main__":
    main()