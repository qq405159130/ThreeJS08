# pip install pillow numpy tqdm #本程序所需插件：基本图像处理；
# pip install opencv-python scikit-image #本程序所需插件：进一步图形处理；
# pip install scikit-learn # 新增库：用于颜色聚类分析
# ----------------------------------------
# 本程序修改规则：
# ① 如果你没有改动我的代码，请不要随意删除相应的注释；
# ② 新增库要标记出来，并注释用于什么；
# ③ 改动部分比较集中在几个方法，则只罗列这几个方法，其余未改动的部分用特定注释提醒即可；
# ----------------------------------------
import numpy as np
from PIL import Image
import json
import os
import re
import time
from tqdm import tqdm

# 新增库：用于纹理分析和颜色信息处理
# ----------------------------------------
import cv2  # 用于图像处理（颜色空间转换等）
from skimage.feature import graycomatrix, graycoprops  # 用于纹理特征提取
from skimage.color import rgb2hsv  # 新增：用于RGB到HSV颜色空间转换
from sklearn.cluster import KMeans  # 新增：用于颜色聚类分析
from collections import defaultdict  # 新增：用于颜色分布统计
# ----------------------------------------

# 定义地形类型
TERRAIN_TYPES = {
    "OCEAN": 0,
    "PLAIN": 1,
    "HILL": 2,
    "MOUNTAIN": 3,
    "HIGH_MOUNTAIN": 4,
    "LAKE": 5
}

# 定义地形名称
TERRAIN_NAMES = {
    0: "海洋",
    1: "平原",
    2: "丘陵",
    3: "山地",
    4: "高山",
    5: "湖泊"
}

# 新增方法：分析图像的颜色分布
# ----------------------------------------
def analyze_color_distribution(image):
    """
    分析图像的颜色分布，提取主要颜色特征
    :param image: PIL图像对象
    :return: 颜色分布统计结果（HSV格式）
    """
    # 将图像转换为HSV颜色空间
    hsv_image = np.array(image.convert("HSV"))
    h, s, v = hsv_image[:, :, 0], hsv_image[:, :, 1], hsv_image[:, :, 2]
    
    # 统计颜色分布
    color_distribution = defaultdict(int)
    for i in range(h.shape[0]):
        for j in range(h.shape[1]):
            # 将HSV值归一化到[0, 1]范围
            h_norm = h[i, j] / 255.0
            s_norm = s[i, j] / 255.0
            v_norm = v[i, j] / 255.0
            color_distribution[(h_norm, s_norm, v_norm)] += 1
    
    return color_distribution

def extract_color_features(color_distribution):
    """
    根据颜色分布提取关键颜色特征
    :param color_distribution: 颜色分布统计结果
    :return: 颜色分类规则（字典形式）
    """
    # 使用K-means聚类提取主要颜色
    colors = np.array(list(color_distribution.keys()))
    kmeans = KMeans(n_clusters=6)  # 假设有6种主要地形
    kmeans.fit(colors)
    
    # 提取聚类中心点
    color_centers = kmeans.cluster_centers_
    
    # 根据聚类中心点调整颜色分类规则
    color_rules = {}
    for center in color_centers:
        h, s, v = center
        if v < 0.3 and 0.6 < h < 0.7:
            color_rules["OCEAN"] = (h, s, v)
        elif s < 0.2 and 0.2 < h < 0.4:
            color_rules["PLAIN"] = (h, s, v)
        elif 0.05 < h < 0.15 and 0.3 < v < 0.7:
            color_rules["HILL"] = (h, s, v)
        elif 0.9 < h < 1.0 or 0.0 < h < 0.05:
            color_rules["MOUNTAIN"] = (h, s, v)
        elif s > 0.5 and v > 0.8:
            color_rules["HIGH_MOUNTAIN"] = (h, s, v)
        elif 0.6 < h < 0.7 and 0.3 < s < 0.6:
            color_rules["LAKE"] = (h, s, v)
    
    return color_rules
# ----------------------------------------

# 修改方法：基于颜色的分类（动态调整版）
# ----------------------------------------
def get_terrain_type_by_color(color, color_rules):
    """
    根据颜色信息判断地形类型（动态调整版）
    :param color: RGB颜色值
    :param color_rules: 颜色分类规则
    :return: 地形类型
    """
    # 将RGB颜色转换为HSV颜色空间
    h, s, v = rgb2hsv(np.array(color).reshape(1, 1, 3)).reshape(3)
    
    # 根据动态颜色规则分类
    if "OCEAN" in color_rules and v < 0.3 and 0.6 < h < 0.7:
        return TERRAIN_TYPES["OCEAN"]
    elif "PLAIN" in color_rules and s < 0.2 and 0.2 < h < 0.4:
        return TERRAIN_TYPES["PLAIN"]
    elif "HILL" in color_rules and 0.05 < h < 0.15 and 0.3 < v < 0.7:
        return TERRAIN_TYPES["HILL"]
    elif "MOUNTAIN" in color_rules and (0.9 < h < 1.0 or 0.0 < h < 0.05):
        return TERRAIN_TYPES["MOUNTAIN"]
    elif "HIGH_MOUNTAIN" in color_rules and s > 0.5 and v > 0.8:
        return TERRAIN_TYPES["HIGH_MOUNTAIN"]
    elif "LAKE" in color_rules and 0.6 < h < 0.7 and 0.3 < s < 0.6:
        return TERRAIN_TYPES["LAKE"]
    else:
        return TERRAIN_TYPES["PLAIN"]  # 默认平原
# ----------------------------------------

def get_terrain_type_by_texture(patch):
    """
    根据纹理特征判断地形类型（增强版）
    :param patch: 图像块（灰度图像）
    :return: 地形类型
    """
    # 计算灰度共生矩阵（GLCM），多角度提取纹理特征
    glcm = graycomatrix(patch, distances=[1], angles=[0, 45, 90, 135], levels=256, symmetric=True, normed=True)
    
    # 提取更多纹理特征
    contrast = graycoprops(glcm, 'contrast').mean()
    energy = graycoprops(glcm, 'energy').mean()
    correlation = graycoprops(glcm, 'correlation').mean()  # 相关性
    homogeneity = graycoprops(glcm, 'homogeneity').mean()  # 同质性
    
    # 根据纹理特征分类（规则优化）
    if contrast > 0.5 and energy < 0.2:
        return TERRAIN_TYPES["MOUNTAIN"]  # 山地
    elif contrast < 0.2 and energy > 0.5:
        return TERRAIN_TYPES["PLAIN"]  # 平原
    elif correlation > 0.7 and homogeneity > 0.6:
        return TERRAIN_TYPES["LAKE"]  # 湖泊
    elif 0.3 < contrast < 0.5 and 0.3 < energy < 0.5:
        return TERRAIN_TYPES["HILL"]  # 丘陵
    else:
        return TERRAIN_TYPES["PLAIN"]  # 默认平原

# 修改方法：纹理与颜色协调分类（动态调整版）
# ----------------------------------------
def get_terrain_type_by_texture_and_color(patch, color, color_rules):
    """
    结合纹理和颜色信息判断地形类型（动态调整版）
    :param patch: 图像块（灰度图像）
    :param color: RGB颜色值
    :param color_rules: 颜色分类规则
    :return: 地形类型
    """
    # 基于纹理分类
    terrain_type_texture = get_terrain_type_by_texture(patch)
    
    # 基于颜色分类（动态调整版）
    terrain_type_color = get_terrain_type_by_color(color, color_rules)
    
    # 协调规则：优先使用纹理分类，但当颜色分类为湖泊或海洋时，优先使用颜色分类
    if terrain_type_color in [TERRAIN_TYPES["OCEAN"], TERRAIN_TYPES["LAKE"]]:
        return terrain_type_color
    else:
        return terrain_type_texture
# ----------------------------------------

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


# 修改后的取样方法
def sample_image(image, hex_width, hex_height, sampling_method, color_rules):
    """对图片进行六边形网格取样"""
    width, height = image.size
    data = []
    index_x = 0
    index_y = 0

    # 计算总网格数
    total_cells = (height // hex_height) * (width // hex_width)

    # 将图像转换为灰度图像（用于纹理分析）
    image_gray = np.array(image.convert("L"))

    # 初始化进度条
    with tqdm(total=total_cells, desc="取样进度", unit="cell") as pbar:
        start_time = time.time()  # 记录开始时间

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
                    # 提取当前网格的灰度图像块
                    patch_gray = image_gray[y:y + hex_height, x:x + hex_width]
                    
                    # 使用纹理和颜色协调分类
                    terrain_type = get_terrain_type_by_texture_and_color(patch_gray, avg_color, color_rules)
                    
                    # 保存结果
                    data.append({
                        "x": index_x,
                        "y": index_y,
                        "terrain": terrain_type,
                        # "humidity": humidity_level,
                        # "height": height_level,
                        # "latitude": latitude_level
                    })
                index_x += 1
                pbar.update(1)  # 更新进度条

                # 计算已用时间和预测剩余时间
                elapsed_time = time.time() - start_time
                cells_processed = pbar.n
                if cells_processed > 0:
                    estimated_total_time = (elapsed_time / cells_processed) * total_cells
                    remaining_time = estimated_total_time - elapsed_time
                    pbar.set_postfix({
                        "已用时间": f"{elapsed_time:.2f}s",
                        "预测总时间": f"{estimated_total_time:.2f}s",
                        "预测剩余时间": f"{remaining_time:.2f}s"
                    })

            index_x = 0
            index_y += 1

    return data


def show_statistics(data):
    """显示统计信息"""
    total_cells = len(data)

    # a. 各地形数量及占比
    terrain_counts = {}
    for d in data:
        terrain = d["terrain"]
        terrain_name = TERRAIN_NAMES.get(terrain, "未知")
        terrain_counts[terrain_name] = terrain_counts.get(terrain_name, 0) + 1

    print("\n=== 各地形数量及占比 ===")
    for terrain, count in terrain_counts.items():
        percentage = (count / total_cells) * 100
        print(f"{terrain}: {count} 个，占比 {percentage:.2f}%")

    # b. 各高度占比
    if "height" in data[0]: #（仅在数据中包含 height 字段时显示）
        height_bins = [0, 50, 100, 150, 200, 255]
        height_counts = {f"{height_bins[i]}-{height_bins[i+1]}": 0 for i in range(len(height_bins) - 1)}
        for d in data:
            height = d["height"]
            for i in range(len(height_bins) - 1):
                if height_bins[i] <= height < height_bins[i + 1]:
                    height_counts[f"{height_bins[i]}-{height_bins[i+1]}"] += 1
                    break

        print("\n=== 各高度占比 ===")
        for range_, count in height_counts.items():
            percentage = (count / total_cells) * 100
            print(f"高度 {range_}: {count} 个，占比 {percentage:.2f}%")

    # c. 各湿度占比
    if "humidity" in data[0]: #（仅在数据中包含 humidity 字段时显示）
        humidity_bins = [0, 3, 6, 10]
        humidity_counts = {f"{humidity_bins[i]}-{humidity_bins[i+1]}": 0 for i in range(len(humidity_bins) - 1)}
        for d in data:
            humidity = d["humidity"]
            for i in range(len(humidity_bins) - 1):
                if humidity_bins[i] <= humidity < humidity_bins[i + 1]:
                    humidity_counts[f"{humidity_bins[i]}-{humidity_bins[i+1]}"] += 1
                    break

        print("\n=== 各湿度占比 ===")
        for range_, count in humidity_counts.items():
            percentage = (count / total_cells) * 100
            print(f"湿度 {range_}: {count} 个，占比 {percentage:.2f}%")

def parse_size_input(size_input):
    """解析尺寸输入"""
    # 统一将中文逗号替换为英文逗号
    size_input = size_input.replace("，", ",")
    
    # 判断输入格式
    if size_input.startswith("("):
        # 格式为 (1, 30*20) 或 (2, 30*20)
        pattern = r"\((\d),\s*(\d+)\*(\d+)\)"
        match = re.match(pattern, size_input)
        if match:
            size_type = int(match.group(1))
            width = int(match.group(2))
            height = int(match.group(3))
            return size_type, width, height
    else:
        # 格式为 30*20，默认为格式1
        width, height = map(int, size_input.split("*"))
        return 1, width, height
    
    # 如果输入格式不正确，返回默认值
    return 1, 30, 20

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

    # 分析颜色分布并提取颜色分类规则
    color_distribution = analyze_color_distribution(image)
    color_rules = extract_color_features(color_distribution)

    # 提示用户选择尺寸
    default_size = "30*20"  # 默认尺寸
    size_input = input(f"请输入尺寸（格式：(1, 宽度*高度) 或 (2, 宽度*高度)，默认 {default_size}，直接回车使用默认值）：")
    size_input = size_input if size_input else default_size

    # 解析尺寸输入
    size_type, width, height = parse_size_input(size_input)

    # 根据尺寸类型计算六边形网格尺寸
    if size_type == 1:
        # 格式1：地图单元格的横纵数量
        hex_width = image.width // width
        hex_height = image.height // height
    else:
        # 格式2：六边形网格的尺寸
        hex_width = width
        hex_height = height

    # 提示用户选择取样方式
    sampling_method = input("请输入取样方式（1: 网格内所有像素平均, 2: 网格中心点范围平均, 默认1）：")
    sampling_method = int(sampling_method) if sampling_method else 1

    # 提示用户选择取样种类
    sampling_type = input("请输入取样种类（1: 仅地形数据, 2: 所有数据, 默认1）：")
    sampling_type = int(sampling_type) if sampling_type else 1

    # 提示用户是否填满高度
    fill_height = input("是否填满高度（y/n，默认 y）：")
    if fill_height.lower() != 'n':
        normalize_height = True
    else:
        normalize_height = False

    # 提示用户是否显示统计信息
    show_stats = input("是否显示统计信息（y/n，默认 y）：")
    if show_stats.lower() != 'n':
        show_statistics_flag = True
    else:
        show_statistics_flag = False

    # 取样
    data = sample_image(image, hex_width, hex_height, sampling_method, color_rules)

    # 根据取样种类过滤数据
    if sampling_type == 1:
        data = [{"x": d["x"], "y": d["y"], "terrain": d["terrain"]} for d in data]
    else:
        # 如果用户选择取样种类为 2（所有数据），则保留所有字段
        pass

    # 填满高度（仅在数据中包含 height 字段时执行）
    if normalize_height and sampling_type == 2:
        data = normalize_heights(data)

    # 显示统计信息
    if show_statistics_flag:
        show_statistics(data)

    # 保存为JSON文件
    output_path = "map_data.json"
    with open(output_path, "w") as f:
        json.dump(data, f, indent=4)

    print(f"取样完成，结果已保存到 {output_path}")

    input("已结束，回车可关闭窗口")
# ----------------------------------------

if __name__ == "__main__":
    main()