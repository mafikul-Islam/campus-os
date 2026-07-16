import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

const files = [
  'src/components/NotesView.tsx',
  'src/components/ProfileView.tsx',
  'src/components/AnalyticsView.tsx',
  'src/components/CalendarView.tsx',
  'src/components/DocumentsView.tsx',
  'src/components/ChatsView.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const code = fs.readFileSync(file, 'utf8');
  
  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    let hasMotionImport = false;
    let modified = false;

    traverse.default(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === 'motion/react' || path.node.source.value === 'framer-motion') {
          path.node.specifiers.forEach(spec => {
            if (spec.imported && spec.imported.name === 'motion') {
              hasMotionImport = true;
            }
          });
        }
      },
      JSXOpeningElement(path) {
        if (path.node.name.name === 'div' || path.node.name.name === 'motion.div') {
          const classNameAttr = path.node.attributes.find(
            attr => attr.type === 'JSXAttribute' && attr.name.name === 'className'
          );
          if (classNameAttr && classNameAttr.value && classNameAttr.value.type === 'StringLiteral' && classNameAttr.value.value.includes('glass-card')) {
            // Check if it's already a motion.div
            let isMotionDiv = false;
            if (path.node.name.type === 'JSXIdentifier' && path.node.name.name === 'div') {
              // Convert to motion.div
              path.node.name.name = 'motion.div';
              if (path.parent.closingElement) {
                path.parent.closingElement.name.name = 'motion.div';
              }
              isMotionDiv = true;
            } else if (path.node.name.type === 'JSXMemberExpression' && path.node.name.object.name === 'motion' && path.node.name.property.name === 'div') {
              isMotionDiv = true;
            }

            if (isMotionDiv) {
              // Check if animate is present
              const hasAnimate = path.node.attributes.some(attr => attr.type === 'JSXAttribute' && attr.name.name === 'animate');
              if (!hasAnimate) {
                // Add animate={{ y: [0, -4, 0] }}
                // Add transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                // Using generic AST nodes is verbose, let's just use string replacement on the generated code later OR add attributes here.
              }
            }
          }
        }
      }
    });
    
  } catch(e) {
    console.error(`Error parsing ${file}:`, e);
  }
});
