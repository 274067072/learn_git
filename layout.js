function getstyle(element) {
  if (!element.style) {
    element.style = {};
  }
  for (let prop in element.computedStyle) {
    element.style[prop] = element.computedStyle[prop].value;
    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop]);
    }
  }
  return element.style;
}

function layout(element) {
  if (!element.computedStyle) {
    return;
  }
  var elementstyle = getstyle(element);
  if (elementstyle.display !== "flex") {
    return;
  }
  var items = element.children.filter((e) => e.type === "element");
  items.sort(function (a, b) {
    return (a.order || 0) - (b.order || 0);
  });
  var style = elementstyle;
  ["width", "height"].forEach((size) => {
    if (style[size] === "auto" || style[size] === "") {
      style[size] = null;
    }
  });
  if (!style.flexDirection || style.flexDirection === "auto") {
    style.flexDirection = "row";
  }
  if (!style.alignItems || style.alignItems === "auto") {
    style.alignItems = "stretch";
  }
  if (!style.justifyContent || style.justifyContent === "auto") {
    style.justifyContent = "flex-start";
  }
  if (!style.flexWrap || style.flexWrap === "auto") {
    style.flexWrap = "nowrap";
  }
  if (!style.alignContent || style.alignContent === "auto") {
    style.alignContent = "stretch";
  }
  var mainSize,
    mainStart,
    mainEnd,
    mainSign,
    mainBase,
    crossSize,
    crossStart,
    crossEnd,
    crossSign,
    crossBase;
  if (style.flexDirection === "row") {
    mainSize = "width";
    mainStart = "left";
    mainEnd = "right";
    mainSign = +1;
    mainBase = 0;
    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }
  if (style.flexDirection === "row-reverse") {
    mainSize = "width";
    mainStart = "right";
    mainEnd = "left";
    mainSign = -1;
    mainBase = style.width;
    crossSize = "height";
    crossStart = "top";
    crossEnd = "bottom";
  }
  if (style.flexDirection === "column") {
    mainSize = "height";
    mainStart = "top";
    mainEnd = "bottom";
    mainSign = +1;
    mainBase = 0;
    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }
  if (style.flexDirection === "column-reverse") {
    mainSize = "height";
    mainStart = "bottom";
    mainEnd = "top";
    mainSign = -1;
    mainBase = style.height;
    crossSize = "width";
    crossStart = "left";
    crossEnd = "right";
  }
  if (style.flexWrap === "wrap-reverse") {
    var tmp = crossStart;
    crossStart = crossEnd;
    crossEnd = tmp;
    crossSign = -1;
  } else {
    crossBase = 0;
    crossSign = 1;
  }
  var isAutoMainSize = false;
  if (!style[mainSize]) {
    elementstyle[mainSize] = 0;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemstyle = getstyle(item);
      if (itemstyle[mainSize] != null || itemstyle[mainSize] !== void 0) {
        elementstyle[mainSize] = elementstyle[mainSize] + itemstyle[mainSize];
      }
    }
    isAutoMainSize = true;
  }
  var flexLine = [];
  var flexLines = [flexLine];
  var mainSpace = elementstyle[mainSize];
  var crossSpace = 0;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemstyle = getstyle(item);
    if (itemstyle[mainSize] === null) {
      itemstyle[mainSize] = 0;
    }
    if (itemstyle.flex) {
      flexLine.push(item);
    } else if (style.flexWrap === "nowrap" || isAutoMainSize) {
      mainSpace -= itemstyle[mainSize];
      if (itemstyle[crossSize] != null && itemstyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, itemstyle[crossSize]);
      }
      flexLine.push(item);
    } else {
      if (itemstyle[mainSize] > style[mainSize]) {
        itemstyle[mainSize] = style[mainSize];
      }
      if (mainSpace < itemstyle[mainSize]) {
        flexLine.mainSpace = mainSpace;
        flexLine.crossSpace = crossSpace;
        flexLine = [item];
        flexLines.push(flexLine);
        mainSpace = style[mainSize];
        crossSpace = 0;
      } else {
        flexLine.push(item);
      }
      if (itemstyle[crossSize] !== null && itemstyle[crossSize] !== void 0) {
        crossSpace = Math.max(crossSpace, itemstyle[crossSize]);
      }
      mainSpace -= itemstyle[mainSize];
    }
  }

  flexLine.mainSpace = mainSpace;
  if (style.flexWrap === "nowrap" || isAutoMainSize) {
    flexLine.crossSpace =
      style[crossSize] !== undefined ? style[crossSize] : crossSpace;
  } else {
    flexLine.crossSpace = crossSpace;
  }
  if (mainSpace < 0) {
    var scale = style[mainSize] / (style[mainSize] - mainSize);
    var currentMain = mainBase;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemstyle = getstyle(item);

      if (itemstyle.flex) {
        itemstyle[mainSize] = 0;
      }
      itemstyle[mainSize] = itemstyle[mainSize] * scale;
      itemstyle[mainStart] = currentMain;
      itemstyle[mainEnd] = item[mainStart] + mainSign * itemstyle[mainSize];
      currentMain = itemstyle[mainEnd];
    }
  } else {
    flexLines.forEach(function (items) {
      var flexTotal = 0;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemstyle = getstyle(item);

        if (itemstyle.flex !== null && itemstyle.flex !== void 0) {
          flexTotal += itemstyle.flex;
          continue;
        }
      }
      if (flexTotal > 0) {
        var currentMain = mainBase;
        for (vari = 0; i < items.length; i++) {
          var item = items[i];
          var itemstyle = getstyle(item);

          if (itemstyle.flex) {
            itemstyle[mainSize] = (mainSpace / flexTotal) * itemstyle.flex;
          }
          itemstyle[mainStart] = currentMain;
          itemstyle[mainEnd] = itemstyle + mainSign * itemstyle[mainSize];
          currentMain = itemstyle[mainEnd];
        }
      } else {
        if (style.justifyContent === "flex-start") {
          var currentMain = mainBase;
          var step = 0;
        }
        if (style.justifyContent === "flex-end") {
          var currentMain = mainSpace * mainSign + mainBase;
          var step = 0;
        }
        if (style.justifyContent === "center") {
          var currentMain = (mainSpace / 2) * mainSign + mainBase;
          var step = 0;
        }
        if (style.justifyContent === "space-between") {
          var step = (mainSpace / (items.length - 1)) * mainSign;
          var currentMain = mainBase;
        }
        if (style.justifyContent === "space-around") {
          var step = (mainSpace / items.length) * mainSign;
          var currentMain = step / 2 + mainBase;
        }
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var itemstyle = getstyle(item);
          itemstyle[mainStart] = currentMain;
          itemstyle[mainEnd] =
            itemstyle[mainStart] + mainSign * itemstyle[mainSize];
          currentMain = itemstyle[mainEnd] + step;
        }
      }
    });
  }
  var crossSpace;
  if (!style[crossSize]) {
    crossSpace = 0;
    elementstyle[crossSize] = 0;
    for (var i = 0; i < flexLines.length; i++) {
      elementstyle[crossSize] =
        elementstyle[crossSize] + flexLines[i].crossSpace;
    }
  } else {
    crossSpace = style[crossSize];
    for (var i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace;
    }
  }
  if (style.flexWrap === "wrap-reverse") {
    crossBase = style[crossSize];
  } else {
    crossBase = 0;
  }
  var step;
  if (style.alignContent === "flex-start") {
    crossBase += 0;
    step = 0;
  }
  if (style.alignContent === "flex-end") {
    crossBase += crossSign * crossSpace;
    step = 0;
  }
  if (style.alignContent === "center") {
    crossBase += (crossSign * crossSpace) / 2;
    step = 0;
  }
  if (style.alignContent === "space-between") {
    crossBase += 0;
    step = crossSpace / (flexLines.length - 1);
  }
  if (style.alignContent === "space-around") {
    step = crossSpace / flexLines.length;
    crossBase += (crossSign * step) / 2;
  }
  if (style.alignContent === "stretch") {
    crossBase += 0;
    step = 0;
  }
  flexLines.forEach(function (items) {
    var lineCrossSize =
      style.alignContent === "stretch"
        ? items.crossSpace + crossSpace / flexLines.length
        : items.crossSpace;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var itemstyle = getstyle(item);
      var align = itemstyle.alignSelf || style.alignItems;
      if (itemstyle[crossSize] === null) {
        itemstyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
      }
      if (align === "flex-start") {
        itemstyle[crossStart] = crossBase;
        itemstyle[crossEnd] =
          itemstyle[crossStart] + crossSign * itemstyle[crossSize];
      }
      if (align === "flex-end") {
        itemstyle[crossEnd] = crossBase + crossSign * lineCrossSize;
        itemstyle[crossStart] =
          itemstyle[crossEnd] - crossSign * itemstyle[crossSize];
      }
      if (align === "center") {
        itemstyle[crossStart] =
          crossBase + (crossSign * (lineCrossSize - itemstyle[crossSize])) / 2;
        itemstyle[crossEnd] =
          itemstyle[crossStart] + crossSign * itemstyle[crossSize];
      }
      if (align === "stretch") {
        itemstyle[crossStart] = crossBase;
        itemstyle[crossEnd] =
          crossBase +
          crossSign *
            (itemstyle[crossSize] !== null && itemstyle[crossSize] !== void 0
              ? itemstyle[crossSize]
              : lineCrossSize);
        itemstyle[crossSize] =
          crossSign * (itemstyle[crossEnd] - itemstyle[crossStart]);
      }
    }
    crossBase += crossSign * (lineCrossSize + step);
  });
}

module.exports = layout;
