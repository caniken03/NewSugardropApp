#!/usr/bin/env python3

import re

# Read the original file
with open('/app/frontend/app/(modals)/add-entry.tsx', 'r') as f:
    content = f.read()

# Read the replacement content
with open('/app/temp_replacement.txt', 'r') as f:
    replacement = f.read()

# Find the first occurrence of the pattern and replace it
old_pattern = r'          <View style={styles\.inputContainer}>'
new_content = re.sub(old_pattern, replacement.rstrip(), content, count=1)

# Write the modified content back
with open('/app/frontend/app/(modals)/add-entry.tsx', 'w') as f:
    f.write(new_content)

print("Replacement completed successfully")