// Manage family data and interact with database

function displayFamilyMembers() {
    const FamilyData = JSON.parse(localStorage.getItem('familyData'));
    const container = document.querySelector('#family-container');
    FamilyData.forEach(member => {
        const memberElement = document.createElement('div');
        memberElement.classList.add('family-member');
        
        const nameElement = document.createElement('span');
        nameElement.textContent = member.username;
        nameElement.classList.add('family-member-name');
        
        const roleElement = document.createElement('span');
        roleElement.textContent = ` (${member.role})`;
        roleElement.classList.add('family-member-role');
        
        memberElement.appendChild(nameElement);
        memberElement.appendChild(roleElement);
        
        container.appendChild(memberElement);
    });
}

displayFamilyMembers();