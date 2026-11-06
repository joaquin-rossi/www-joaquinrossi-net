# Windows XP High Resolution Icon Pack

Windows XP icons redrawn at 1024×1024 by **marchmountain**, taken from:

https://www.deviantart.com/marchmountain/art/Windows-XP-High-Resolution-Icon-Pack-916042853

`Icon Pack.pdf` is the document that ships with the pack.

**These files are not covered by this repository's AGPL license.** They are redraws of
Microsoft icons; all rights belong to their respective owners.

## Icons used on the site

Nothing in this folder is served by the site (it is excluded from the Docker image). The
icons that are used are copied, downscaled, into `public/`:

| File in `public/`            | Source                                       |
| ---------------------------- | -------------------------------------------- |
| `favicon.ico` (16, 32, 48)   | `Windows XP Icons/Control Panel.png`         |
| `icons/folder-closed-32.png` | `Windows XP Icons/Folder Closed.png`         |
| `icons/folder-closed-96.png` | `Windows XP Icons/Folder Closed.png`         |
| `icons/control-panel-64.png` | `Windows XP Icons/Control Panel.png`         |
| `icons/home-32.png`          | `Windows XP Icons/IE Home.png`               |
| `icons/email-32.png`         | `Windows XP Icons/Email.png`                 |
| `icons/internet-32.png`      | `Windows XP Icons/Internet Shortcut.png`     |
| `icons/key-32.png`           | `Windows XP Icons/Key.png`                   |
| `icons/address-book-32.png`  | `Windows XP Icons/Address Book.png`          |
| `icons/text-document-32.png` | `Windows XP Icons/Generic Text Document.png` |
| `icons/up-32.png`            | `Windows XP Icons/Up.png`                    |

They are generated with ImageMagick at twice the size they are displayed at:

```sh
V="vendor/windows-xp-icons/Windows XP Icons"
magick "$V/Control Panel.png" -filter Lanczos -define icon:auto-resize=48,32,16 -strip public/favicon.ico
magick "$V/Folder Closed.png" -filter Lanczos -resize 32x32 -strip public/icons/folder-closed-32.png
magick "$V/Folder Closed.png" -filter Lanczos -resize 96x96 -strip public/icons/folder-closed-96.png
magick "$V/Control Panel.png" -filter Lanczos -resize 64x64 -strip public/icons/control-panel-64.png
magick "$V/IE Home.png" -filter Lanczos -resize 32x32 -strip public/icons/home-32.png
magick "$V/Email.png" -filter Lanczos -resize 32x32 -strip public/icons/email-32.png
magick "$V/Internet Shortcut.png" -filter Lanczos -resize 32x32 -strip public/icons/internet-32.png
magick "$V/Key.png" -filter Lanczos -resize 32x32 -strip public/icons/key-32.png
magick "$V/Address Book.png" -filter Lanczos -resize 32x32 -strip public/icons/address-book-32.png
magick "$V/Generic Text Document.png" -filter Lanczos -resize 32x32 -strip public/icons/text-document-32.png
magick "$V/Up.png" -filter Lanczos -resize 32x32 -strip public/icons/up-32.png
```
