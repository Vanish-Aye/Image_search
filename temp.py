import torch
from PIL import Image
import cn_clip.clip as clip
from cn_clip.clip import load_from_name, available_models
import numpy as np

model_name="ViT-H-14"
device=None
download_root='./'
# 设置设备
print("Available models:", available_models())
device = device if device else ("cuda" if torch.cuda.is_available() else "cpu")

# 加载模型和预处理函数
model, preprocess = load_from_name(model_name, device=device, download_root=download_root)
