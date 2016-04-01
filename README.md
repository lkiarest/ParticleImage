# ParticleImage
当鼠标移到图片上时将图片打碎成像素点，然后转换为粒子效果做动画重新组成图片

基于h5的canvas标签实现，所以不支持悲催的低版本 ie (< 9)

```
// 使用方法
ParticleImage.create("logo", "./images/logo.png", "fast");
```

> 第一个参数"logo"为元素的id，需要在css中指定大小，可以为元素指定默认的背景图片
> 第二个参数为图片地址，可以与背景图片相同，支持png，jpg等常用图片格式
> 第三个参数为动画速度，当前支持三种 "fast","mid" and "low"

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
