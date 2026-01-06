#!/usr/bin/env python3
"""
Project Context Generator
Generates a comprehensive project-context.md file containing all project files
"""

import os
import json
from datetime import datetime
from pathlib import Path

# Directories to include
INCLUDE_DIRS = ['src', 'public']

# File extensions to include
INCLUDE_EXTENSIONS = [
    '.tsx', '.ts', '.jsx', '.js', 
    '.css', '.html', '.json', 
    '.md', '.txt', '.env.example'
]

# Files/directories to exclude
EXCLUDE_PATTERNS = [
    'node_modules',
    'dist',
    'build',
    '.git',
    '.vite',
    'bun.lockb',
    'package-lock.json',
    'yarn.lock',
    '.DS_Store',
    'coverage',
    '.env.local',
    '.env'
]

def should_include_file(file_path):
    """Check if file should be included based on extension and exclusions"""
    # Check if any exclude pattern is in the path
    for pattern in EXCLUDE_PATTERNS:
        if pattern in str(file_path):
            return False
    
    # Check if file has an included extension
    return any(str(file_path).endswith(ext) for ext in INCLUDE_EXTENSIONS)

def get_file_tree(root_dir='.', prefix=''):
    """Generate a tree structure of the project"""
    tree = []
    items = []
    
    try:
        items = sorted(os.listdir(root_dir))
    except PermissionError:
        return tree
    
    # Filter out excluded items
    items = [item for item in items if not any(pattern in item for pattern in EXCLUDE_PATTERNS)]
    
    for i, item in enumerate(items):
        path = os.path.join(root_dir, item)
        is_last = i == len(items) - 1
        current_prefix = '└── ' if is_last else '├── '
        
        if os.path.isdir(path):
            tree.append(f"{prefix}{current_prefix}{item}/")
            extension = '    ' if is_last else '│   '
            tree.extend(get_file_tree(path, prefix + extension))
        else:
            if should_include_file(path):
                tree.append(f"{prefix}{current_prefix}{item}")
    
    return tree

def read_file_content(file_path):
    """Read and return file content with error handling"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

def get_line_count(content):
    """Get number of lines in content"""
    return len(content.split('\n'))

def generate_project_context(output_file='frontproject-context.md'):
    """Generate comprehensive project context file"""
    
    print("🚀 Starting project context generation...")
    
    # Get project root
    project_root = Path('.')
    
    # Start building the markdown content
    content = []
    content.append("# UBA Tech Camp - Complete Project Context\n")
    content.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    content.append("---\n")
    
    # Add project structure
    content.append("## 📁 Project Structure\n")
    content.append("```")
    content.append(".")
    content.extend(get_file_tree())
    content.append("```\n")
    
    # Add statistics
    total_files = 0
    total_lines = 0
    files_by_type = {}
    
    # Collect all files
    all_files = []
    for include_dir in INCLUDE_DIRS:
        dir_path = project_root / include_dir
        if dir_path.exists():
            for root, dirs, files in os.walk(dir_path):
                # Remove excluded directories
                dirs[:] = [d for d in dirs if not any(pattern in d for pattern in EXCLUDE_PATTERNS)]
                
                for file in files:
                    file_path = Path(root) / file
                    if should_include_file(file_path):
                        all_files.append(file_path)
    
    # Add package.json info if exists
    package_json_path = project_root / 'package.json'
    if package_json_path.exists():
        content.append("## 📦 Package Information\n")
        try:
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
                content.append(f"**Name:** {package_data.get('name', 'N/A')}")
                content.append(f"**Version:** {package_data.get('version', 'N/A')}")
                content.append(f"**Description:** {package_data.get('description', 'N/A')}\n")
                
                if 'dependencies' in package_data:
                    content.append("### Dependencies")
                    for dep, version in sorted(package_data['dependencies'].items()):
                        content.append(f"- `{dep}`: {version}")
                content.append("")
        except:
            pass
    
    # Add README if exists
    readme_path = project_root / 'README.md'
    if readme_path.exists():
        content.append("## 📖 README\n")
        content.append("```markdown")
        content.append(read_file_content(readme_path))
        content.append("```\n")
    
    # Add all source files
    content.append("## 📄 Source Files\n")
    
    for file_path in sorted(all_files):
        relative_path = file_path.relative_to(project_root)
        file_content = read_file_content(file_path)
        lines = get_line_count(file_content)
        
        # Update statistics
        total_files += 1
        total_lines += lines
        ext = file_path.suffix
        files_by_type[ext] = files_by_type.get(ext, 0) + 1
        
        # Add file section
        content.append(f"### {relative_path}")
        content.append(f"**Lines:** {lines} | **Type:** {ext}\n")
        
        # Determine language for syntax highlighting
        lang_map = {
            '.tsx': 'tsx',
            '.ts': 'typescript',
            '.jsx': 'jsx',
            '.js': 'javascript',
            '.css': 'css',
            '.html': 'html',
            '.json': 'json',
            '.md': 'markdown'
        }
        lang = lang_map.get(ext, '')
        
        content.append(f"```{lang}")
        content.append(file_content)
        content.append("```\n")
    
    # Add statistics section at the beginning
    stats = [
        "## 📊 Project Statistics\n",
        f"- **Total Files:** {total_files}",
        f"- **Total Lines of Code:** {total_lines:,}",
        f"- **Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n",
        "### Files by Type"
    ]
    
    for ext, count in sorted(files_by_type.items(), key=lambda x: x[1], reverse=True):
        stats.append(f"- `{ext}`: {count} files")
    
    stats.append("")
    
    # Insert stats after the header
    content[3:3] = stats
    
    # Write to output file
    output_path = project_root / output_file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(content))
    
    print(f"✅ Project context generated successfully!")
    print(f"📁 Output file: {output_path}")
    print(f"📊 Statistics:")
    print(f"   - Total files: {total_files}")
    print(f"   - Total lines: {total_lines:,}")
    print(f"   - Output size: {os.path.getsize(output_path) / 1024:.2f} KB")

def main():
    """Main entry point"""
    print("=" * 60)
    print("UBA Tech Camp - Project Context Generator")
    print("=" * 60)
    print()
    
    generate_project_context()
    
    print()
    print("=" * 60)
    print("✨ Done!")
    print("=" * 60)

if __name__ == '__main__':
    main()
