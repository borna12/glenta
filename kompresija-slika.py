import os
from PIL import Image

def get_file_size(file_path):
    """
    Get the file size in bytes.

    Args:
    - file_path (str): Path to the file.

    Returns:
    - int: File size in bytes.
    """
    return os.path.getsize(file_path)

def compress_image(input_path, output_path, quality=95):
    """
    Compress an image with lossless quality.

    Args:
    - input_path (str): Path to the input image file.
    - output_path (str): Path to save the compressed image file.
    - quality (int): Quality level for the compression (0-100).

    Returns:
    - None
    """
    with Image.open(input_path) as img:
        img.save(output_path, quality=quality)

def main():
    # Define the folder path
    folder_path = "slike"

    # List of supported image extensions
    extensions = ['.jpg', '.jpeg', '.png']

    # Loop through each file in the folder
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(tuple(extensions)):
            # Construct full file path
            file_path = os.path.join(folder_path, filename)
            
            # Get original file size
            original_size = get_file_size(file_path)
            
            # Compress the image
            print(f"Compressing {filename}...")
            compress_image(file_path, file_path)
            
            # Get compressed file size
            compressed_size = get_file_size(file_path)
            
            # Print original and compressed sizes
            print(f"Original size: {original_size} bytes")
            print(f"Compressed size: {compressed_size} bytes")
            print(f"Compression ratio: {compressed_size/original_size:.2f}x\n")

    print("Compression completed!")

if __name__ == "__main__":
    main()