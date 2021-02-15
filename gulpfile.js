const { src, dest, series, parallel, watch } = require('gulp')
const del = require('del')
const browserSync = require('browser-sync').create()
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')

const babel = require('gulp-babel')

const origin = 'src'
const destination = 'public'

sass.compiler = require('node-sass')

async function clean(cb) {
  await del(destination)
  cb()
}

function html(cb) {
  src(`${origin}/**/*.html`).pipe(dest(destination))
  cb()
}

function scss(cb) {
  src(`${origin}/scss/**/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'compressed',
      }).on('error', sass.logError)
    )
    .pipe(sourcemaps.write('./maps'))
    .pipe(dest(`${destination}/css`))
  cb()
}

function js(cb) {
  src(`${origin}/js/lib/**/*.js`).pipe(dest(`${destination}/js/lib`))

  src(`${origin}/js/script.js`)
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(dest(`${destination}/js`))
  cb()
}

function images(cb) {
  src(`${origin}/assets/*.+(png|jpg|gif|svg)`).pipe(
    dest(`${destination}/assets`)
  )

  src(`${origin}/assets/desktop/*.+(png|jpg|gif|svg)`).pipe(
    dest(`${destination}/assets/desktop`)
  )

  src([`${origin}/assets/mobile/*.+(png|jpg|gif|svg)`]).pipe(
    dest(`${destination}/assets/mobile`)
  )

  src([`${origin}/assets/tablet/*.+(png|jpg|gif|svg)`]).pipe(
    dest(`${destination}/assets/tablet`)
  )

  cb()
}

function watcher(cb) {
  watch(`${origin}/**/*.scss`).on('change', series(scss, browserSync.reload))
  watch(`${origin}/**/*.html`).on('change', series(html, browserSync.reload))
  watch(`${origin}/**/*.js`).on('change', series(js, browserSync.reload))
  cb()
}

function server(cb) {
  browserSync.init({
    notify: false,
    open: false,
    server: {
      baseDir: destination,
    },
  })
  cb()
}

exports.default = series(
  clean,
  parallel(html, scss, js),
  images,
  server,
  watcher
)

exports.build = series(
  clean,
  parallel(html, scss, js),
  images
)
