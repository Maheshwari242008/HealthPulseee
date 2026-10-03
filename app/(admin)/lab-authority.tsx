import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, TextInput, View } from 'react-native';
import { createLab, listLabs, setLabActive } from '@/services/adminLabsService';
import type { LabRecord } from '@/types/admin';

const box = { borderWidth: 1, padding: 10, marginBottom: 8 };

export default function LabAuthority() {
  const [labs, setLabs] = useState<LabRecord[]>([]);
  const [name, setName] = useState('');
  const [labCode, setLabCode] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Solapur');
  const [state, setState] = useState('Maharashtra');
  const [msg, setMsg] = useState('');

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    listLabs()
      .then((result) => {
        if (active) setLabs(result);
      })
      .catch((e) => {
        if (active) setMsg(e instanceof Error ? e.message : 'Failed to load labs');
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function onCreate() {
    setMsg('Creating...');
    try {
      await createLab({ name, labCode, email, city, state });
      setMsg(
        `Created. Give the lab this email (${email.trim().toLowerCase()}) and lab code (${labCode.trim().toUpperCase()}).`,
      );
      setName('');
      setLabCode('');
      setEmail('');
      setReloadKey((k) => k + 1);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to create lab');
    }
  }

  async function onToggle(lab: LabRecord) {
    try {
      await setLabActive(lab.id, !lab.approved);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to update lab');
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Add Lab Authority</Text>
      <TextInput placeholder="Lab name" value={name} onChangeText={setName} style={box} />
      <TextInput
        placeholder="Lab ID (e.g. LAB-MH-001)"
        autoCapitalize="characters"
        value={labCode}
        onChangeText={setLabCode}
        style={box}
      />
      <TextInput
        placeholder="Official email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={box}
      />
      <TextInput placeholder="City" value={city} onChangeText={setCity} style={box} />
      <TextInput placeholder="State" value={state} onChangeText={setState} style={box} />
      <Button title="Create lab authority" onPress={onCreate} />
      {msg ? <Text style={{ marginVertical: 8 }}>{msg}</Text> : null}

      <Text style={{ fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>
        Registered labs ({labs.length})
      </Text>
      {labs.map((lab) => (
        <View key={lab.id} style={{ ...box, gap: 4 }}>
          <Text>
            {lab.name} ({lab.lab_code ?? 'no code'})
          </Text>
          <Text>
            {lab.official_email ?? 'no email'} - {lab.city ?? ''} {lab.state ?? ''}
          </Text>
          <Text>
            Status: {lab.approved ? 'ACTIVE' : 'INACTIVE'} | Signed up: {lab.claimed ? 'yes' : 'not yet'}
          </Text>
          <Button title={lab.approved ? 'Deactivate' : 'Activate'} onPress={() => onToggle(lab)} />
        </View>
      ))}
    </ScrollView>
  );
}
