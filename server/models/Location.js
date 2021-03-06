/**
 * Opportunity Game
 * 
 * Location Model
 * @author Johnny Richardson
 * 
 * For field docs: http://keystonejs.com/docs/database/
 *
 * ==========
 */

const keystone = global.keystone,
    mongoose = require('mongoose');
var Types = keystone.Field.Types;

/**
 * index model
 * @constructor
 * See: http://keystonejs.com/docs/database/#lists-options
 */
var Location = new keystone.List('Location', 
	{
		label: 'Location',
		plural: 'Locations',
    autokey: {
        path: 'key',
        from: 'name',
        unique: true
    }
	});

/**
 * Model Fields
 * @main Location
 */
Location.add({
  name: { type: String, default: "Location Name", hidden: true, required: true, initial: true },
	enabled: { type: Boolean, initial: true, default: true  },
	intro: { type: Types.Markdown, label: "Flavor Text", note: "Limited to 130 characters.", initial: true, required: true },
	image: { type: Types.Select, label: 'Image Type', options: 'career, child-care, cultural-center, hospital, info-center, school, bus, movein', required: true, initial: true },
  
  unlockedAtStart: { type: Types.Boolean, label: "Unlocked at start" },
	category:
        {
            "Community": {type: Types.Boolean},
            "Job": {type: Types.Boolean},
            "English": {type: Types.Boolean},
            "Health": {type: Types.Boolean},
            "Help": {type: Types.Boolean},
            "Discover": {type: Types.Boolean}
        },
  opportunities: {
      type: Types.Relationship,
      ref: 'Opportunity',
      label: 'Opportunities',
      note: 'The opportunities for this location.',
      many: true, 
      filters: { location: ':_id' }
  },

	createdAt: { type: Date, default: Date.now, noedit: true, hidden: true }
});
Location.schema.add({categories: mongoose.Schema.Types.Mixed});
Location.schema.add({categoriesStr: mongoose.Schema.Types.String});

/**
 * Hooks
 * =============
 */
Location.schema.pre('save', function(next) {

    let cleanedObj = {};
    this.categories = {};
    _.each(Object.keys(this.category), (key) => {
      cleanedObj[key.replace(/ /g,"_").toLowerCase()] = this.category[key];
    });

    let savedObj = {
       health: cleanedObj['health'],
       help: cleanedObj['help'],
       english: cleanedObj['english'],
       job: cleanedObj['job'],
       community: cleanedObj['community'],
       discover: cleanedObj['discover']
    };

    this.categories = savedObj;
    this.categoriesStr = "";

    next();

});

/**
 * Model Registration
 */
Location.defaultSort = '-createdAt';
Location.defaultColumns = 'name';
Location.register();