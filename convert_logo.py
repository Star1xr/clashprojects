import os

try:
    import cairosvg
except ImportError:
    print("Error: 'cairosvg' not found. Please run: pip install cairosvg")
    exit(1)

def convert_svg_to_png():
    # Path to your logo
    svg_input = "public/favicon.svg"
    png_output = "marketing_logo.png"

    if not os.path.exists(svg_input):
        print(f"Error: {svg_input} not found!")
        return

    print(f"Converting {svg_input} to {png_output}...")
    
    # Convert with high resolution (scale=10 for marketing quality)
    cairosvg.svg2png(url=svg_input, write_to=png_output, scale=10)
    
    print("Success! Your marketing logo is ready.")

if __name__ == "__main__":
    convert_svg_to_png()
