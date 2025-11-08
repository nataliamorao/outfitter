const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

const outdir = 'dist';

async function build() {
  try {
    const buildDir = path.join(__dirname, outdir);
    
    // 1. Limpa o diretório de saída para garantir um build limpo
    await fs.emptyDir(buildDir);
    console.log('Diretório de saída limpo.');

    // 2. Compila o código TypeScript/React para um único arquivo JavaScript
    await esbuild.build({
      entryPoints: ['./index.tsx'], // Caminho simplificado
      bundle: true,
      outfile: path.join(buildDir, 'index.js'),
      jsx: 'automatic',
      minify: true,
      sourcemap: true,
      target: 'es2020',
      define: { 'process.env.NODE_ENV': '"production"' },
    });
    console.log('Build do JavaScript concluído com sucesso.');

    // 3. Copia o arquivo index.html para o diretório de saída
    await fs.copy('./index.html', path.join(buildDir, 'index.html'));
    console.log('Copiado o index.html.');

    console.log('Build finalizado com sucesso!');
  } catch (error) {
    console.error('O build falhou:', error);
    process.exit(1);
  }
}

build();
