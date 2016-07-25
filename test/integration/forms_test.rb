require 'test_helper'

module DynamicForms
  class FormsTest < ActionDispatch::IntegrationTest
    include DynamicForms::Engine.routes.url_helpers

    setup do
      @routes = DynamicForms::Engine.routes
      Capybara.current_driver = Capybara.javascript_driver
    end

    test "form item fields appear when an item type is selected" do
      # Create a new form
      visit new_form_path
      fill_in "Title", with: "Test Form"
      fill_in "Description", with: "Form Description"
      click_on "Create Form"

      # Edit the form
      click_on "Edit"

      # Ensure a new item form is present
      assert page.has_selector?("fieldset.item")
      assert !page.has_content?("fieldset.item .item_attributes")

      # Ensure the question fields are loaded when a type is selected
      select("Text Question", from: "Type")
      assert page.first(".item_attributes").first(".field").has_field?("Title")

      # Fill in the fields of the first question
      first_question = page.first("fieldset.item")
      within(first_question) do
        fill_in("Key", with: "key1")
        fill_in("Title", with: "Title")
        fill_in("Text",  with: "Test Question")
      end

      # Ensure a new fieldset has been created for adding new items
      assert page.has_selector?("fieldset.item", count: 2)

      # Save the form and ensure no errors
      click_on "Update Form"
      assert page.has_content?("Form was successfully updated")
      assert page.has_content?("Test Form")
    end

  end
end
