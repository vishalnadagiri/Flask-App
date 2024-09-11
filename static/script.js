document.addEventListener('DOMContentLoaded', function() {
    const apiDropdown = document.getElementById('add_api_dropdown');
    const addToListButton = document.getElementById('add_to_list');
    const addApiList = document.getElementById('add_api_list');
    const submitAddUserButton = document.getElementById('submit_add_user');
    const addUserIdInput = document.getElementById('add_user_id');
    
    const removeUserIdInput = document.getElementById('remove_user_id');
    const fetchUserApisButton = document.getElementById('fetch_user_apis');
    const removeApiList = document.getElementById('remove_api_list');
    const removeSelectedApisButton = document.getElementById('remove_selected_apis');
    const feedbackMessage = document.getElementById('feedback-message');

    function updateButtonStates() {
        // Add User tab
        const hasApis = addApiList.querySelectorAll('li').length > 0;
        submitAddUserButton.disabled = !addUserIdInput.value.trim() || !hasApis;
        
        // Remove User tab
        const hasApisToRemove = removeApiList.querySelectorAll('li input:checked').length > 0;
        removeSelectedApisButton.disabled = !removeUserIdInput.value.trim() || !hasApisToRemove;
    }

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = `feedback-message ${type}`;
    }

    // Handle tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('inactive');
            });
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            this.classList.remove('inactive');
            document.getElementById(this.getAttribute('data-tab')).classList.add('active');
            updateButtonStates();
        });
    });

    // Add API to list
    addToListButton.addEventListener('click', function() {
        const selectedApi = apiDropdown.value;
        if (selectedApi) {
            const listItem = document.createElement('li');
            listItem.textContent = selectedApi;
            const removeButton = document.createElement('span');
            removeButton.textContent = 'x';
            removeButton.classList.add('remove');
            removeButton.addEventListener('click', function() {
                addApiList.removeChild(listItem);
                // Restore the API to the dropdown
                const option = document.createElement('option');
                option.value = selectedApi;
                option.textContent = selectedApi;
                apiDropdown.appendChild(option);
                updateButtonStates();
            });
            listItem.appendChild(removeButton);
            addApiList.appendChild(listItem);
            // Remove the API from the dropdown
            apiDropdown.querySelector(`option[value="${selectedApi}"]`).remove();
            updateButtonStates();
        }
    });

    // Add user
    submitAddUserButton.addEventListener('click', function() {
        const userId = addUserIdInput.value.trim();
        const apis = Array.from(addApiList.querySelectorAll('li')).map(li => li.textContent.replace('x', '').trim());
        if (userId && apis.length) {
            fetch('/add_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ 'user_id': userId, 'apis': apis })
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      addApiList.innerHTML = ''; // Clear list
                      const selectOption = apiDropdown.querySelector('option[value=""]');
                      if (!selectOption) {
                          apiDropdown.insertAdjacentHTML('afterbegin', '<option value="">Select an API</option>');
                      }
                      addUserIdInput.value = ''; // Clear user ID field
                      showFeedback('User added successfully', 'success');
                      updateButtonStates();
                  }
              }).catch(() => {
                  showFeedback('Failed to add user', 'error');
              });
        }
    });

    // Fetch user APIs
    fetchUserApisButton.addEventListener('click', function() {
        const userId = removeUserIdInput.value.trim();
        if (userId) {
            fetch('/get_user_apis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ 'user_id': userId })
            }).then(response => response.json())
              .then(data => {
                  if (data.apis) {
                      removeApiList.innerHTML = '';
                      data.apis.forEach(api => {
                          const listItem = document.createElement('li');
                          const checkbox = document.createElement('input');
                          checkbox.type = 'checkbox';
                          checkbox.value = api;
                          checkbox.classList.add('api-checkbox');
                          checkbox.addEventListener('change', updateButtonStates);
                          const label = document.createElement('label');
                          label.textContent = api;
                          listItem.appendChild(checkbox);
                          listItem.appendChild(label);
                          removeApiList.appendChild(listItem);
                      });
                      updateButtonStates();
                  }
              }).catch(() => {
                  showFeedback('Failed to fetch APIs', 'error');
              });
        }
    });

    // Remove selected APIs
    removeSelectedApisButton.addEventListener('click', function() {
        const userId = removeUserIdInput.value.trim();
        const apisToRemove = Array.from(removeApiList.querySelectorAll('li input:checked')).map(checkbox => checkbox.value);
        if (userId && apisToRemove.length) {
            fetch('/remove_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ 'user_id': userId, 'apis': apisToRemove })
            }).then(response => response.json())
              .then(data => {
                  if (data.success) {
                      removeApiList.innerHTML = '';
                      showFeedback('APIs removed successfully', 'success');
                      updateButtonStates();
                  }
              }).catch(() => {
                  showFeedback('Failed to remove APIs', 'error');
              });
        }
    });

    // Initial button state update
    updateButtonStates();
});
