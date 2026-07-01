import fs from 'fs'
import path from 'path'

export interface NavItem {
    name: string
    href: string
    slug: string[]
}

export interface NavGroup {
    title: string
    items: NavItem[]
}

export function getKnowledgeBaseNav(): NavGroup[] {
    const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')
    if (!fs.existsSync(CONTENT_DIR)) return []
    const groups: NavGroup[] = []
    
    const folders = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        
    for (const folder of folders) {
        const folderPath = path.join(CONTENT_DIR, folder)
        const files = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.md'))
            .map(file => {
                const basename = file.replace('.md', '')
                return {
                    name: basename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    href: `/knowledgebase/${folder}/${basename}`,
                    slug: [folder, basename]
                }
            })
            
        groups.push({
            title: folder.charAt(0).toUpperCase() + folder.slice(1),
            items: files
        })
    }
    
    return groups
}

export function getKnowledgeBaseContent(folder: string, file: string): string | null {
    const filePath = path.join(process.cwd(), 'src', 'content', folder, `${file}.md`)
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8')
    }
    return null
}
