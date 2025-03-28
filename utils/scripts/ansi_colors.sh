#!/bin/bash

# # Optional names for the first 16 ANSI colors
# declare -a color_names=(
#   "Black" "Red" "Green" "Yellow" "Blue" "Magenta" "Cyan" "White"
#   "Bright Black" "Bright Red" "Bright Green" "Bright Yellow"
#   "Bright Blue" "Bright Magenta" "Bright Cyan" "Bright White"
# )

# Print column headers
# printf "\n%-14s %-14s  %s\n" "Foreground" "Background" "Name"
printf "\n| %-12s  %-12s|\n" "Foreground" "Background"
# printf "%0.s-" {1..40}; echo
printf "%0.s-" {1..28}; echo

# # Edge-case for black
# printf "\033[48;5;7m\033[38;5;0m %-12s\033[0m  " " 38;5;0m "
# printf "\033[48;5;0m\033[38;5;7m %-12s\033[0m  " " 48;5;0m "
# printf "%s\n" "Black"

# Print all 256 colors
for i in {0..255}; do
#   name=""
#   if [ $i -lt 16 ]; then
#     name="${color_names[$i]}"
#   fi

  fg_seq="38;5;${i}m"
  bg_seq="48;5;${i}m"

  # Foreground preview (text in color on black)
#   printf "\033[48;5;0m\033[${fg_seq} %-12s\033[0m  " " FG $i "
#   printf "\033[48;5;0m\033[${fg_seq} %-12s\033[0m  " " $fg_seq "
  printf "|\033[${fg_seq} %-12s\033[0m" " $fg_seq "


  # Background preview (black text on color)
#   printf "\033[${bg_seq}\033[38;5;16m %-12s\033[0m  " " BG $i "
#   printf "\033[${bg_seq}\033[38;5;16m %-12s\033[0m  " " $bg_seq "
  printf "\033[${bg_seq} %-12s\033[0m |" " $bg_seq "

#   # Name
#   printf "%s\n" "$name"
  printf "\n"
done

# # ##### (with bg and fg sequences)
# # Optional names for the first 16 ANSI colors
# declare -a color_names=(
#   "Black" "Red" "Green" "Yellow" "Blue" "Magenta" "Cyan" "White"
#   "Bright Black" "Bright Red" "Bright Green" "Bright Yellow"
#   "Bright Blue" "Bright Magenta" "Bright Cyan" "Bright White"
# )

# echo -e "ANSI 256 Color Table\n"

# for i in {0..255}; do
#   # Escape sequence without leading \033[
#   esc_seq="38;5;${i}m"
  
#   # Try to get color name for first 16, otherwise leave blank
#   name=""
#   if [ $i -lt 16 ]; then
#     name="${color_names[$i]}"
#   fi

#   # Escape sequences (no \033[ prefix)
#   fg_seq="38;5;${i}m"
#   bg_seq="48;5;${i}m"

#   # Print background color block with black text
#   printf "\033[48;5;%sm\033[38;5;16m BG %3d \033[0m" "$i" "$i"

#   # Print foreground color block with black background
#   printf " \033[48;5;0m\033[38;5;%sm FG %3d \033[0m" "$i" "$i"

#   # Print escape sequences and optional name
#   printf "  FG: %-9s BG: %-9s  %s\n" "$fg_seq" "$bg_seq" "$name"
# done
# # #####

