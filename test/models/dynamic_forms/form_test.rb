require 'test_helper'

module DynamicForms
  class FormTest < ActiveSupport::TestCase

    test "it requires a title" do
      form = Form.new
      assert form.invalid?
      assert form.errors[:title].any?
    end

    test "it has a list of items" do
      form = Form.new
      assert form.respond_to?(:items)
    end

    test "it should order the list of items" do
      form = create :form
      create :form_item, form: form, position: 2
      create :form_item, form: form, position: 1
      assert_equal 1, form.items.first.position
    end

    test "it should have a list of questions" do
      form = create :form
      q1 = create(:form_item, :question, form: form)
      create(:form_item, form: form)
      assert_equal [q1], form.questions
    end
  end
end
