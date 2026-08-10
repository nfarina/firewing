# Crosswing Colors

This explains our thought process behind the unique way Crosswing manages colors at runtime in the browser.

## Color Spaces

Color spaces can be brain-melting. We are making a few assumptions for Crosswing that attempt to help designers and developers fall into the pit of success.

Color spaces are all about defining what colors - perceptually, to your eye - are possible on a given display. It's always a subset of what your eyes can actually see.

Different displays support different color spaces. For example, a newer display (like all Apple devices) supports the P3 color space. If you told that display, for instance using a native application, to render a "pure red" color, and put it next to an older CRT monitor from the 90s that you also told to render "pure red", the new display would look WAY MORE RED than the older display. This is because the newer display has better hardware, and P3 is a way of describing what newer hardware is capable of.

So now there's a problem - if you are designing a website, and say your page background is #FF0000, exactly how red - to your eye - should that be? People fretted a lot about this in the early days of the web - they wanted to make sure that #FF0000 looked the same on both displays. So they created the sRGB color space, which is a way of limiting the possible colors you can get. It's like a "lowest common denominator" color space. So by default, if you write `background: #FF0000` in CSS, you will get a red that looks the same on both displays - that is, a duller red that the 90s CRT can reproduce.

This bothered me for a very long time, because I always had a newer display. I'd pick a vibrant color in Photoshop, then get the HEX code and put it in my CSS, and it would look dull and lifeless. Why "protect" my users from beautiful color on monitors that supported it?

It took me a long time to consider the other scenario - when a designer is using (or used long ago) an older monitor to pick colors. They might pick #FF0000 and use it as a page background, and it looks fine to them, but if I load that page on my newer monitor, without sRGB "protecting" me, it would be eye-bleeding, way too bright! Because my "maximum red" is much redder than the original designer's "maximum red".

This doesn't happen in practice, because all browsers assume that #FF0000 should be interpreted as an sRGB color. sRGB describes what #FF0000 should actually _look like_, and does NOT mean "All red pixels at 100% brightness".

As a result, the web is full of dull, lifeless colors.

Fast-forward like 20 years.

When designing UI in Figma, the most popular design tool right now, you are typically picking from a set of all the colors your monitor can display. Just like Photoshop in the 90s! These days, we all have newer monitors, so we are picking from a set of colors that is much larger than sRGB, usually P3.

And it's like Groundhog Day - you pick a beautiful color in Figma, give the HEX code to a developer, and it looks dull and lifeless in the browser. Then you Google around and find huge walls of text about color theory and color spaces and give up.

The core problem here is that HEX codes, to a browser, are _always_ sRGB. Always always always. There is no way to use a HEX code in CSS without it being interpreted as sRGB. Same with the rgba() function, hsl(), etc.

But Figma, and most design tools, are _not_ respecting this. They default to an "unmanaged" color space, where #FF0000 really does mean "all the red your monitor can give" (although note that your _monitor itself_ is likely assigned a color space like P3 in your system settings, which will _itself_ cap the amount of maximum red!).

You could of course tell Figma (and most design tools) to render colors using the "sRGB" managed color space, such that #FF0000 renders that "safe", dull red just like the browser, but most people don't bother - or more likely, have no idea what it all means and just want all the colors they can get.

In Crosswing, we assume, unlike the browser, that hex codes are in the P3 color space. Our goal is to get your colors to show up in the browser the same way they do in Figma "unmanaged" mode.

Fortunately, most recent browsers now support the `color()` function, which lets you specify a color in a different color space. So we can use that to get the browser to render the color the same way Figma does.

Here's a great article (from way back in 2016!) that goes into more detail about this:

https://webkit.org/blog/6682/improving-color-on-the-web/

Our goal with this library is to make it so when you give us "#FF0000" from Figma, we give you a CSS color like `color(display-p3 1 0 0)`. Specifically, the `hexColor()` builder assumes you mean P3 by default, and will render it that way if both your browser and monitor supports it. And if it doesn't? You'll see a not-so-bright red, and that's fine!

## Transforming Colors

RGB, that is, the idea of defining a color by its red, green, and blue components, really only makes sense for displays. In the old days, you would simply "blit" (write) the RGB values directly to the screen, and the screen would set the red, green, and blue pixels directly to produce the color you wanted.

While RGB is great for displays, it's terrible for humans. We don't think of color in terms of how much red, green, and blue it has. It's much easier to think of a color in terms of its hue (is it red? purple?), its lightness, and how saturated it is compared to gray.

Historically, you might have reached for HSL (hue, saturation, lightness) to describe a color. But HSL has its own problems. For example, it's not perceptually uniform, which means that if you increase the saturation of a color, it might look like it's changing hue. Or if you increase the lightness, it can get less saturated. This doesn't match our intuition about how color "works".

For this reason, new color spaces like CIELAB and CIELCH were developed. Then, someone further improved them to be perceptually uniform, and called them OKLAB and OKLCH. Explained here:

https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl

So when you say `colors.mediumBlue({ lighten: 0.2 })` we use OKLCH for these conversions. Our goal is to let designers (and developers!) modify colors intuitively, like "darker version of this reference color for a border", or "lighter version of this color for a background".
