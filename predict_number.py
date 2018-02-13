import sys
import numpy as np
from keras.models import load_model
from skimage.io import imread
from skimage.color import rgb2gray
from skimage import transform as tf
import json

def resize(img_array, size=400):
    h, w, c = img_array.shape
    if min(h, w) == 480: # 元画像用 640 x 480 -> 400 x 400に変換
        padding_h = int((h-size) / 2)
        padding_w = int((w-size) / 2)
        return img_array[padding_h:padding_h + size, padding_w: padding_w + size]
    else: # Thumbnail用 80 x 60 -> 60 x 60に変換
        return img_array[10:70, :]


def predict_image_by_model(img_filename_list, model_filename):
    img_list = []
    for img_filename in img_filename_list.split(','):
        img = rgb2gray(tf.resize(resize(imread(img_filename)), (32, 32), mode='reflect'))
        img_list.append(np.expand_dims(img, -1))
    model = load_model(model_filename)
    pred = model.predict(np.stack(img_list))
    return np.argmax(pred, axis=1).tolist()
    

if __name__ == '__main__':
    img_filename_list = sys.argv[1]
    model_filename = sys.argv[2]

    print(json.dumps(predict_image_by_model(img_filename_list, model_filename)))
