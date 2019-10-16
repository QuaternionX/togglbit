function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Toggl Account</Text>}>
        <TextInput
          label="Api token"
          settingsKey="token"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
