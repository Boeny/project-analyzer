const EXCLUDED_EXT = ['json', 'css', 'png', 'svg', 'jpg', 'jpeg'];

const TREE_FILTER_EXCLUDE = {
    libs: f => f.includes('/') && !f.includes('react-icons') && !f.includes('moment'),
    ['@']: f => !f.includes('@'),
    http: f => !f.includes('http'),
}

EXCLUDED_EXT.forEach(ext => TREE_FILTER_EXCLUDE[ext] = f => !f.includes('.'+ext));

module.exports = {TREE_FILTER_EXCLUDE}
