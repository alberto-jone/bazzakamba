// postcss.config.cjs
module.exports = {
  plugins: {
    // Esta é a sintaxe moderna e correta para usar o Tailwind como plugin do PostCSS
    'tailwindcss': {},
    // O Autoprefixer deve vir depois do Tailwind
    'autoprefixer': {},
  }
}