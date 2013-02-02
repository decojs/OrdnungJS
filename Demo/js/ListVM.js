define(["ordnung/qvc", "knockout"], function(qvc, ko){
	function Name(firstName, lastName){
		this.fullName = firstName + " " + lastName;
	}


	function ListVM(){
		var self = this;
		
		this.list = ko.observableArray();
		this.filter = ko.observable("");
		this.filteredList = ko.computed(function(){
			return self.list().filter(function(item){
				return item.fullName.indexOf(self.filter()) >= 0;
			});
		});
		
		this.addName = function(firstName, lastName){
			this.list.push(new Name(firstName, lastName));
		};
		
		this.getNameList = qvc.createQuery({
			name: "GetAllNames",
			result: function(names){
				self.list(names.map(function(name){
					return new Name(name.firstName, name.lastName);
				}));
			},
			parameters: {
				key: "name"
			}
		});
		
		
		
		(function(){
			self.getNameList.execute();
		})();
	}
	
	return ListVM;
});