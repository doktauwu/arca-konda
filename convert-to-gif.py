import sys
from moviepy.editor import *
VideoFileClip(sys.argv[1]).speedx(1).write_gif(sys.argv[2])