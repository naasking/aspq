# AspQ - A `JavaScript` Event Queue for ASP.NET #

ASP.NET does not prevent multiple postback requests from being initiated by users. This is only exacerbated by the addition of AJAX extensions, since we can now have async and sync postbacks running concurrently, and it's a race to see which one wins.

AspQ is a simple event queue that captures all sync and async postbacks and runs them in event order, one after another. It requires only 1 script include in your web forms and 1 line added to your form's onsubmit event. Alternately, you can add these globally via server-side code that can be shared across an entire project.

`JavaScript` include and form event handler:
```
<script type="text/javascript" src="/path/to/AspQ.js"></script>
...
<form runat="server" onsubmit="return AspQ.submit(this)">
  ...
```
Alternately, you can add both in the OnInit method for your site's Page base class:
```
override protected void OnInit(EventArgs e)
{
  ...
  // add script site-wide
  var script = new HtmlGenericControl("script");
  script.Attributes.Add("type", "text/javascript");
  script.Attributes.Add("src", "/path/to/AspQ.js");
  this.Header.Controls.Add(script);

  // register form submission script
  this.ClientScript.RegisterOnSubmitStatement(GetType(), "PreventDuplicateSubmits", "return AspQ.submit(this);");
  ...
}
```