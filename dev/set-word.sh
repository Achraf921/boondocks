#!/bin/sh
# Sets the word the game swaps in for the {n} token in every line of dialogue.
#   dev/set-word.sh <word>
[ -z "$1" ] && { echo "usage: $0 <word>"; exit 1; }
cd "$(dirname "$0")/.." || exit 1
sed -i '' "s/^  BD\.WORD = .*/  BD.WORD = '$1';/" js/slang.js && grep "BD.WORD = " js/slang.js
