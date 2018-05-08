var dName = document.domain;
if ((dName.indexOf(".com") > -1) && (dName.indexOf(".") > -1))
 {
  var dNameArr = dName.split(".");
  if (dNameArr.length > 1) 
   {
    dName = dNameArr[dNameArr.length - 2] + "." + dNameArr[dNameArr.length - 1];
   }
   try 
    {
     document.domain = dName;
    }
   catch(err)
    {
    }
  }