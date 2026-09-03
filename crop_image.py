from PIL import Image

# Load the original image from the previous upload
img_path = '/Users/nicosubealanube/.gemini/antigravity/brain/715fbd79-28d9-40da-94db-a45e477e0a3e/.user_uploaded/media_1788441746921.jpg'
img = Image.open(img_path)
width, height = img.size

# We want the bottom 500 pixels.
# The crop box is (left, upper, right, lower)
crop_height = int(width * (9/16)) # 16:9 aspect ratio based on width
# wait, let's just make it a square from the bottom to be safe, or 16:9
crop_height = 400
left = 0
upper = height - crop_height
right = width
lower = height

cropped_img = img.crop((left, upper, right, lower))
cropped_img.save('src/assets/banda.jpg')
print(f"Original size: {width}x{height}")
print(f"Cropped to: left={left}, upper={upper}, right={right}, lower={lower}")
