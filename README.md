# ParticleImage
图片转换为粒子效果

演示脚本：

```html
<!DOCTYPE html>
<html>
    <head>
        <title>particle image</title>
        <meta charset="utf-8" />
        <style>
            #logo {
                margin-left:20px;
                margin-top:20px;
                width:160px;
                height:48px;
                background:url('./images/logo.png');
                /*border: 1px solid red;*/
            }
        </style>
        <script type="text/javascript" src="ParticleImage.js"></script>
        <script>
            window.onload = function() {
                ParticleImage.create("logo", "./images/logo.png", "fast");
            };
        </script>
    </head>
    <body>
        <div id="logo"></div>
    </body>
</html>
```
