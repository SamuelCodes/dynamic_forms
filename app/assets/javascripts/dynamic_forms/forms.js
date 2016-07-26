// Module for managing the addition of new items to a form
// using the Rails' nested forms method. Requires that the
// controller build one new FormItem with a class of .new
// to use as a template for item additions.
DynamicForms.nestedFormEditor = (function($) {

  var nestedEditor = null;

  var itemTemplate = null;

  var cloneItemTemplate = function() {
    itemTemplate = nestedEditor.find("fieldset.item.new").first().clone(true);
  };

  var replaceIndicies = function(template, newIndex) {
    var updateInputsAndLabels = function() {
      var element = $(this);
      var updateAttribute = function() {
        var attribute = this;
        if(!element.attr(attribute)) { return; }
        element.attr(attribute, element.attr(attribute).replace(/(\d+)/, newIndex));
      };
      $(["name", "id", "for"]).each(updateAttribute);
    };
    template.find("[name], label").each(updateInputsAndLabels);
    return template;
  }

  var prepareFields = function(fieldset, fields) {
    var idParts = fieldset.find("select").first().attr("id").split("_");
    // Since we're using nested_forms_for :item, we replace `type` with `attributes`
    idParts[idParts.length-1] = "attributes";
    // Parse the given HTML
    var $html = $(fields).find("div");
    // Iterate through each input field, replacing id and name
    $html.find("[name]").each(function(index, el) {
      // Adjust names to be acceptable params in controller
      if(el.hasAttribute("name")) {
        var name = idParts[0];
        for(var i=1; i<idParts.length; i++) {
          if(idParts[i+1] == "attributes") {
            name += "[" + idParts[i] + "_" + idParts[i+1] + "]";
            i++;
          } else {
            name += "[" + idParts[i] + "]";
          }
        }
        var shortNameRe = /\[(\S+)\]/;
        var shortName = el.attributes["name"].value.match(shortNameRe)[1];
        var preParts = idParts.slice(0);
        preParts.push(shortName);
        var fullId = preParts.join("_");
        name += "[" + shortName + "]"
        // Change the name and id of the inputs
        el.attributes["name"].value = name;
        el.attributes["id"].value = fullId;
        // Change the label's for attribute
        $(el).prev("label").attr("for", fullId);
      }
    });
    // Return the fields adjusted for the fieldset
    return $html;
  };

  var appendNewItemFieldset = function() {
    var newIndex = nestedEditor.find("fieldset.new").size();
    var newItem = replaceIndicies(itemTemplate.clone(true), newIndex);
    nestedEditor.find("fieldset.item").last().after(newItem);
  };

  var itemTypeChanged = function() {
    var select = $(event.target);
    var fieldset = select.parents("fieldset.item");

    var updateItemTypeFields = function(data, success, xhr) {
      if(data.question) { fieldset.addClass("question"); }
      else              { fieldset.removeClass("question"); }
      fieldset.find(".item_attributes").html(prepareFields(fieldset, data.fields));
    }
    // Reset the item if no item type was selected
    if(select.val() == "") { updateItemTypeFields({ question: false, fields: "" }); }
    else { $.getJSON(Routes.dynamic_forms_item_fields_path(select.val()), updateItemTypeFields); }
    // If this was the new item, make sure another is appended
    if(fieldset.hasClass("new") && select.val() !== "") { appendNewItemFieldset(); }
  };

  var ready = function() {
    nestedEditor = $(".dynamic_forms.nested.editor");
    if(nestedEditor) {
      cloneItemTemplate();
      nestedEditor.on("change", "fieldset.new .item_type", itemTypeChanged);
    }
  };


  return {
    ready: ready
  };

})(jQuery);


$(document).ready(DynamicForms.nestedFormEditor.ready);
